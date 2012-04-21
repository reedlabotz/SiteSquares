import os
from datetime import datetime
from flask import Flask
from flask import request
from flask.ext.sqlalchemy import SQLAlchemy
import json


app = Flask(__name__)
#app.debug = True
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
        return "<Color %s>" % self.color
    
    @property
    def serialize(self):
        return {'id':self.id,'color':self.color,'timestamp':self.timestamp.strftime('%Y-%m-%dT%H:%M:%S')}

@app.route('/')
def hello():
    callback = request.args.get('jsonp_callback', '')
    colors = Color.query.all()
    data = json.dumps([i.serialize for i in colors])
    return "%s(%s);"%(callback,data)

@app.route('/color/<color>')
def color(color):
    try:
        if not (int(color,16) < 16777216):
            return "bad color"
    except:
        return "bad color"
    try:
        c = Color(color)
        db.session.add(c)
        db.session.commit()
    except:
        return "error"
    return "thanks"

if __name__ == '__main__':
    # Bind to PORT if defined, otherwise default to 5000.
    port = int(os.environ.get('PORT', 5000))
    db.create_all()
    app.run(host='0.0.0.0', port=port)
