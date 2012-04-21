import os
from datetime import datetime
from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
db = SQLAlchemy(app)

class Color(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    color = db.Column(db.String(6))
    timestamp = db.Column(db.DateTime())

    def __init__(self,color):
        self.color = color
        self.timestamp = datetime.now()

    def __repr__(self):
        return "<Color %s,%s>" % (self.datetime,self.color)

@app.route('/')
def hello():
    return 'Hello World!'

@app.route('/color/<color>')
def color(color):
    c = Color(color)
    db.session.add(c)
    db.session.commit()
    return "thanks: %s"%c

if __name__ == '__main__':
    # Bind to PORT if defined, otherwise default to 5000.
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
