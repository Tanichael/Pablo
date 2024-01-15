from flask import Flask, request, jsonify, render_template, send_from_directory, redirect
from flask_restx import Resource, Api
from flask_sqlalchemy import SQLAlchemy
import random
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
import os

db = SQLAlchemy()
app = Flask(__name__, static_folder="./static/")
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///test.db"
app.config['SECRET_KEY'] = os.urandom(24)
db.init_app(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

@app.route('/index')
@login_required
def index():
  return render_template('index.html')

@app.route('/registration')
def registration():
  return render_template('registration.html')

@app.route('/description')
def description():
  return render_template('description.html')

@app.route('/comment')
def comment():
  return render_template('comment.html')


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

@app.route('/signup', methods=['GET', 'POST'])
def signup():
  if request.method == 'POST':
    user_name = request.form.get('username')
    password = request.form.get('password')
    user = User(name=user_name, password=generate_password_hash(password, method='sha256'))
    db.session.add(user)
    db.session.commit()
    return redirect('login')
  else:
    return render_template('signup.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
  if request.method == "POST":
    user_name = request.form.get('username')
    password = request.form.get('password')
    user = User.query.filter_by(name=user_name).first()
    if check_password_hash(user.password, password):
      login_user(user)
      return redirect('index')
  else:
    return render_template('login.html')
  
@app.route('/logout')
@login_required
def logout():
  logout_user()
  return redirect('login')

#API
@app.route('/work/<int:id>')
@login_required
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
@login_required
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

@app.route('/comment/get/work=<int:work_id>')
@login_required
def comments_by_work(work_id):
  comments = db.session.execute(db.select(Comment).filter_by(work_id=work_id)).scalars().all()
  comment_list = []
  for comment in comments:
    comment_list.append(
      {
        "id": comment.id,
        "user_id": comment.user_id,
        "work_id": comment.work_id,
        "comment": comment.comment,
        "user_name": comment.user.name,
      }
    )
  return comment_list

@app.route('/comment/get')
@login_required
def comments_by_user():
  user_id = current_user.id
  comments = db.session.execute(db.select(Comment).filter_by(user_id=user_id)).scalars().all()
  comment_list = []
  for comment in comments:
    comment_list.append(
      {
        "id": comment.id,
        "user_id": comment.user_id,
        "work_id": comment.work_id,
        "comment": comment.comment,
        "user_name": comment.user.name
      }
    )
  return comment_list

@app.route('/comment/post', methods=["POST"])
@login_required
def add_comment():
  # user_id = request.form.get("user_id")
  user_id = current_user.id
  work_id = request.form.get("work_id")
  comment_content = request.form.get("comment")
  print(f'user{user_id}, work{work_id}, comment_content{comment_content}')
  comment = Comment(user_id=user_id, work_id=work_id, comment=comment_content)
  db.session.add(comment)
  db.session.commit()
  return redirect('/index')

@app.route('/like/post/comment=<int:comment_id>&user=<int:user_id>', methods=["POST"])


@app.route('/like/get/comment=<int:comment_id>')
def like_num_by_comment(comment_id):
  user_id = current_user.id
  likes = db.session.execute(db.select(Like).filter_by(comment_id=comment_id)).scalars().all()
  likes_num = len(likes)
  print(likes_num)

  included = False
  for like in likes:
    if like.user.id == user_id:
      included = True
      break
  
  return {
    "likes_num": likes_num,
    "is_included": included
  }


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

class User(UserMixin, db.Model):
  __tablename__ = "users"
  id = db.Column(db.Integer, primary_key=True)
  name = db.Column(db.String(50), nullable=False, unique=True)
  password = db.Column(db.String(25))

@login_manager.user_loader
def load_user(user_id):
  return User.query.get(int(user_id))

class Comment(db.Model):
  __tablename__ = "comments"
  id = db.Column(db.Integer, primary_key=True)
  user_id = db.Column(db.Integer, db.ForeignKey("users.id", name="fk_user"), nullable=False)
  work_id = db.Column(db.Integer, db.ForeignKey("works.id", name="fk_work"), nullable=False)
  comment = db.Column(db.String, nullable=False)
  user = db.relationship('User')
  work = db.relationship('Work')

class Like(db.Model):
  __tablename__ = "likes"
  id = db.Column(db.Integer, primary_key=True)
  user_id = db.Column(db.Integer, db.ForeignKey("users.id", name="fk_user"), nullable=False)
  comment_id = db.Column(db.Integer, db.ForeignKey("comments.id", name="fk_comment"), nullable=False)
  user = db.relationship('User')
  comment = db.relationship('Comment')