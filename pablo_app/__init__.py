from flask import Flask, request, jsonify, render_template
from flask_restx import Resource, Api
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
app = Flask(__name__, static_folder="./static/")
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///test.db"
db.init_app(app)
# api = Api(app, doc='/doc/')

# @api.route('/hello/<name>/<email>')
# class Hello(Resource):
#     def get(self, name, email):
#         return {
#             "name": name,
#             "email": email
#         }
    
#     def post(self, name, email):
#         body = request.json
#         return {
#             "name": name,
#             "email": email,
#             "body": body,
#         }

@app.route('/')
@app.route('/<name>')
def index(name=None):
    return render_template('index.html', name=name)

@app.route('/users')
def users():
    print(request.method)
    return "<p>Users</p>"

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_name = db.Column(db.String, nullable=False)
    email = db.Column(db.String, nullable=False)
    password = db.Column(db.String, nullable=False)

class Work(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String, nullable=False)
    creator = db.Column(db.String, nullable=False)
    description = db.Column(db.String, nullable=False)

@app.route("/user")
def create_user():
    user = User(
        user_name="Tom",
        email="heyhey.com",
        password="hogehoge"
    )
    db.session.add(user)
    db.session.commit()
    return "<p>Create User</p>"

@app.route("/works")
def get_works():
    works = db.session.execute(db.select(Work)).scalars()
    res = []
    for work in works:
        res.append({
            "id": work.id,
            "title": work.title,
            "creator": work.creator,
            "description": work.description
        })
        print(work.creator)
    return jsonify(res)

