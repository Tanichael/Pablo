from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_restx import Resource, Api
from flask_sqlalchemy import SQLAlchemy
import random

db = SQLAlchemy()
app = Flask(__name__, static_folder="./static/")
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///test.db"
db.init_app(app)


@app.route('/')
def index():
  return render_template('index.html')


@app.route('/description')
def description():
  return render_template('description.html')


@app.route('/users')
def users():
  print(request.method)
  return "<p>Users</p>"


@app.route('/img/icons/<path:filename>')
def img_icon(filename):
  return send_from_directory('img/icons', filename)


@app.route('/img/works/<path:filename>')
def img_work(filename):
  return send_from_directory('img/works', filename)

#API
@app.route('/work/<int:id>')
def work(id=1):
  works = db.session.execute(db.select(Work)).scalars().all()
  if id <= 0 or id > len(works):
    id = (id - 1 + len(works)) % len(works) + 1
  print(f'id: {id}')
  work = db.session.execute(db.select(Work).filter_by(id=id)).scalar_one()
  return {
      "id": work.id,
      "title": work.title,
      "creator": {
        "id": work.creator.id,
        "name": work.creator.name
      },
      "description": work.description
  }


@app.route('/work/random/<int:bef_id>')
def work_random(bef_id):
  works = db.session.execute(db.select(Work)).scalars().all()
  rand_id = bef_id
  while rand_id == bef_id:
    rand_id = random.randint(1, len(works))
  print(f'rand_id: {rand_id}')
  work = db.session.execute(db.select(Work).filter_by(id=rand_id)).scalar_one()
  return {
      "id": work.id,
      "title": work.title,
      "creator": {
        "id": work.creator.id,
        "name": work.creator.name
      },
      "description": work.description
  }

@app.route('/comment/<int:work_id>')
def comment_by_work(work_id):
  comments = db.session.execute(db.select(Comment).filter_by(work_id=work_id)).scalars().all()
  comment_list = []
  for comment in comments:
    comment_list.append(
      {
        "id": comment.id,
        "user_id": comment.user_id,
        "work_id": comment.work_id,
        "comment": comment.comment
      }
    )
  
  return comment_list

# class User(db.Model):
#   id = db.Column(db.Integer, primary_key=True)
#   user_name = db.Column(db.String, nullable=False)
#   email = db.Column(db.String, nullable=False)
#   password = db.Column(db.String, nullable=False)

class Work(db.Model):
  __tablename__ = "works"
  id = db.Column(db.Integer, primary_key=True)
  title = db.Column(db.String, nullable=False)
  creator_id = db.Column(db.Integer, db.ForeignKey("creators.id", name="fk_creator"), nullable=False)
  description = db.Column(db.String, nullable=False)
  creator = db.relationship('Creator')

class Creator(db.Model):
  __tablename__ = "creators"
  id = db.Column(db.Integer, primary_key=True)
  name = db.Column(db.String, nullable=False)

class User(db.Model):
  __tablename__ = "users"
  id = db.Column(db.Integer, primary_key=True)
  name = db.Column(db.String, nullable=False)

class Comment(db.Model):
  __tablename__ = "comments"
  id = db.Column(db.Integer, primary_key=True)
  user_id = db.Column(db.Integer, db.ForeignKey("users.id", name="fk_user"), nullable=False)
  work_id = db.Column(db.Integer, db.ForeignKey("works.id", name="fk_work"), nullable=False)
  comment = db.Column(db.String, nullable=False)
  user = db.relationship('User')
  work = db.relationship('Work')



# @app.route("/user")
# def create_user():
#   user = User(user_name="Tom", email="heyhey.com", password="hogehoge")
#   db.session.add(user)
#   db.session.commit()
#   return "<p>Create User</p>"

# @app.route("/works")
# def get_works():
#   works = db.session.execute(db.select(Work)).scalars()
#   res = []
#   for work in works:
#     res.append({
#         "id": work.id,
#         "title": work.title,
#         "creator": work.creator,
#         "description": work.description
#     })
#     print(work.creator)
#   return jsonify(res)
