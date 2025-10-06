from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///app.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)
CORS(app)

# --- Models ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)

# --- Routes ---
@app.route('/')
def home():
    return "🚀 Flask is running!"

@app.route('/api/users', methods=['GET', 'POST'])
def users():
    if request.method == 'GET':
        users = User.query.all()
        return jsonify([{"id": u.id, "username": u.username} for u in users])
    elif request.method == 'POST':
        data = request.get_json()
        new_user = User(username=data['username'])
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "User created!", "id": new_user.id}), 201

# ✅ Only create tables when running directly
if __name__ == "__main__":
    with app.app_context():   # <-- this ensures the context is active
        db.create_all()
    app.run(port=5000, debug=True)


# --------------------
# from flask import Flask 

# app = Flask(__name__)

# #Members API route 
# @app.route("/members")
# def members():
#     return {"members": ["Member1", "Member2", "Member3"]}


# if __name__ == "__main__":
#     app.run(debug=True)