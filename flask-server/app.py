from flask import Flask, jsonify, request, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from werkzeug.utils import secure_filename
import os
import datetime as dt

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///app.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-key")
app.config["UPLOAD_FOLDER"] = os.path.join(os.path.dirname(__file__), "uploads")
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024  # 10MB
app.config["DEMO_MODE"] = (os.environ.get("DEMO_MODE", "true").lower() == "true")

db = SQLAlchemy(app)
CORS(app)
bcrypt = Bcrypt(app)
s = URLSafeTimedSerializer(app.config["SECRET_KEY"])  # token serializer

# --- Models ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.DateTime, default=dt.datetime.utcnow, nullable=False)

    def set_password(self, password: str) -> None:
        self.password_hash = bcrypt.generate_password_hash(password).decode("utf-8")

    def check_password(self, password: str) -> bool:
        return bcrypt.check_password_hash(self.password_hash, password)


class ClothingItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    image_filename = db.Column(db.String(255), nullable=False)
    category = db.Column(db.String(50), nullable=True)
    color = db.Column(db.String(50), nullable=True)  # hex
    item_type = db.Column(db.String(30), nullable=True)  # top, bottom, shoes, accessories, pullover
    vibes = db.Column(db.String(255), nullable=True)     # comma-separated tags
    created_at = db.Column(db.DateTime, default=dt.datetime.utcnow, nullable=False)

    user = db.relationship("User", backref=db.backref("clothing_items", lazy=True))


class SharedOutfit(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    # store item ids as comma-separated string for simplicity
    item_ids = db.Column(db.String(512), nullable=False)
    created_at = db.Column(db.DateTime, default=dt.datetime.utcnow, nullable=False)

    user = db.relationship("User")


def ensure_upload_folder() -> None:
    if not os.path.exists(app.config["UPLOAD_FOLDER"]):
        os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

# --- Routes ---
@app.route('/')
def home():
    return "🚀 Flask is running!"

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    username = (data.get('username') or '').strip()
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    if not username or not email or not password:
        return jsonify({"error": "username, email, and password are required"}), 400

    if User.query.filter((User.username == username) | (User.email == email)).first():
        return jsonify({"error": "username or email already exists"}), 409

    user = User(username=username, email=email)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    token = s.dumps({"uid": user.id})
    return jsonify({"token": token, "user": {"id": user.id, "username": user.username}}), 201


@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    identifier = (data.get('usernameOrEmail') or '').strip()
    password = data.get('password') or ''

    if not identifier or not password:
        return jsonify({"error": "username/email and password are required"}), 400

    user = User.query.filter((User.username == identifier) | (User.email == identifier.lower())).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "invalid credentials"}), 401

    token = s.dumps({"uid": user.id})
    return jsonify({"token": token, "user": {"id": user.id, "username": user.username}})


def require_auth(f):
    from functools import wraps

    @wraps(f)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            # Demo bypass: allow usage without auth by assigning a demo user
            if app.config.get("DEMO_MODE"):
                demo = User.query.filter_by(username='demo').first()
                if not demo:
                    demo = User(username='demo', email='demo@example.com', password_hash='!')
                    db.session.add(demo)
                    db.session.commit()
                request.current_user = demo
                return f(*args, **kwargs)
            return jsonify({"error": "missing bearer token"}), 401
        token = auth_header.split(' ', 1)[1]
        try:
            data = s.loads(token, max_age=60 * 60 * 24 * 7)  # 7 days
        except SignatureExpired:
            return jsonify({"error": "token expired"}), 401
        except BadSignature:
            return jsonify({"error": "invalid token"}), 401

        user_id = data.get('uid')
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "user not found"}), 401
        # attach user to request context
        request.current_user = user
        return f(*args, **kwargs)

    return wrapper


@app.route('/api/items', methods=['GET'])
@require_auth
def list_items():
    items = ClothingItem.query.filter_by(user_id=request.current_user.id).order_by(ClothingItem.created_at.desc()).all()
    return jsonify([
        {
            "id": it.id,
            "imageUrl": f"/api/uploads/{it.image_filename}",
            "category": it.category,
            "color": it.color,
            "itemType": it.item_type,
            "vibes": (it.vibes.split(',') if it.vibes else []),
            "createdAt": it.created_at.isoformat(),
        }
        for it in items
    ])


@app.route('/api/items', methods=['POST'])
@require_auth
def upload_item():
    ensure_upload_folder()
    if 'file' not in request.files:
        return jsonify({"error": "file is required"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "empty filename"}), 400
    filename = secure_filename(file.filename)
    # Make filename unique
    basename, ext = os.path.splitext(filename)
    timestamp = dt.datetime.utcnow().strftime('%Y%m%d%H%M%S%f')
    unique_name = f"{basename}_{timestamp}{ext}"
    save_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_name)
    file.save(save_path)

    category = request.form.get('category')
    color = request.form.get('color')
    item_type = request.form.get('item_type')
    vibes_list = request.form.getlist('vibes') or (request.form.get('vibes') or '').split(',')
    vibes_list = [v.strip() for v in vibes_list if v and v.strip()]
    vibes = ','.join(dict.fromkeys(vibes_list)) if vibes_list else None

    item = ClothingItem(
        user_id=request.current_user.id,
        image_filename=unique_name,
        category=category,
        color=color,
        item_type=item_type,
        vibes=vibes,
    )
    db.session.add(item)
    db.session.commit()

    return jsonify({
        "id": item.id,
        "imageUrl": f"/api/uploads/{item.image_filename}",
        "category": item.category,
        "color": item.color,
        "itemType": item.item_type,
        "vibes": (item.vibes.split(',') if item.vibes else []),
        "createdAt": item.created_at.isoformat(),
    }), 201


@app.route('/api/items/<int:item_id>', methods=['DELETE'])
@require_auth
def delete_item(item_id: int):
    item = ClothingItem.query.filter_by(id=item_id, user_id=request.current_user.id).first()
    if not item:
        return jsonify({"error": "item not found"}), 404
    # Try to remove the file
    try:
        os.remove(os.path.join(app.config['UPLOAD_FOLDER'], item.image_filename))
    except OSError:
        pass
    db.session.delete(item)
    db.session.commit()
    return jsonify({"status": "deleted"})


@app.route('/api/uploads/<path:filename>')
def serve_upload(filename):
    ensure_upload_folder()
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


@app.route('/api/shared', methods=['GET'])
def list_shared():
    outfits = SharedOutfit.query.order_by(SharedOutfit.created_at.desc()).limit(50).all()
    def expand_items(ids_str):
        try:
            ids = [int(x) for x in ids_str.split(',') if x]
        except Exception:
            ids = []
        items = ClothingItem.query.filter(ClothingItem.id.in_(ids)).all() if ids else []
        # maintain order as given
        id_to_item = {i.id: i for i in items}
        ordered = [id_to_item[i] for i in ids if i in id_to_item]
        return [
            {
                "id": it.id,
                "imageUrl": f"/api/uploads/{it.image_filename}",
                "category": it.category,
                "color": it.color,
                "itemType": it.item_type,
                "vibes": (it.vibes.split(',') if it.vibes else []),
            }
            for it in ordered
        ]
    return jsonify([
        {
            "id": o.id,
            "userId": o.user_id,
            "items": expand_items(o.item_ids),
            "createdAt": o.created_at.isoformat(),
        }
        for o in outfits
    ])


@app.route('/api/shared/mine', methods=['GET'])
@require_auth
def list_shared_mine():
    outfits = SharedOutfit.query.filter_by(user_id=request.current_user.id).order_by(SharedOutfit.created_at.desc()).all()
    # reuse expansion via list_shared
    return list_shared()


@app.route('/api/shared', methods=['POST'])
@require_auth
def create_shared():
    data = request.get_json() or {}
    item_ids = data.get('itemIds') or []
    if not isinstance(item_ids, list) or not item_ids:
        return jsonify({"error": "itemIds must be a non-empty array"}), 400
    # ensure items exist
    valid_ids = [i.id for i in ClothingItem.query.filter(ClothingItem.id.in_(item_ids)).all()]
    if not valid_ids:
        return jsonify({"error": "no valid items"}), 400
    ids_str = ','.join(str(i) for i in valid_ids)
    o = SharedOutfit(user_id=request.current_user.id, item_ids=ids_str)
    db.session.add(o)
    db.session.commit()
    return jsonify({"id": o.id}), 201

# ✅ Only create tables when running directly
if __name__ == "__main__":
    with app.app_context():   # <-- this ensures the context is active
        db.create_all()
        ensure_upload_folder()
    app.run(port=5000, debug=True)
