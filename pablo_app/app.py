from flask import Flask, request
from flask_restx import Resource, Api

app = Flask(__name__)
api = Api(app)

@api.route('/hello/<name>/<email>')
class Hello(Resource):
    def get(self, name, email):
        return {
            "name": name,
            "email": email
        }
    
    def post(self, name, email):
        body = request.json
        return {
            "name": name,
            "email": email,
            "body": body,
        }

@app.route('/')
def hello_world():
    return "<p>Hello world!</p>"

@app.route('/users')
def users():
    print(request.method)
    return "<p>Users</p>"
