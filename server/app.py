import os
from datetime import datetime,timedelta
from flask import Flask, request, redirect
from flask.ext.sqlalchemy import SQLAlchemy
from sqlalchemy import desc
import json


app = Flask(__name__)
#app.debug = True
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
#app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////tmp/test.db'
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
def main():
    return redirect('http://reedlabotz.github.com/SiteSquares/', code=302)


@app.route('/colors')
def colors():
    try:
        callback = request.args.get('jsonp_callback', '')
        tail = request.args.get('tail')
        colors = Color.query.order_by(desc(Color.timestamp)).limit(int(tail))
        data = json.dumps([i.serialize for i in colors])
    except:
        return "error"
    return "%s(%s);"%(callback,data)

@app.route('/colors/day')
def colors_day():
    try:
        callback = request.args.get('jsonp_callback','')
        delta = timedelta(days=1)
        colors = Color.query.filter("timestamp>=:time").params(time=(datetime.now()-delta)).order_by(Color.timestamp)
        data = json.dumps([i.serialize for i in colors])
    except:
        return "error"
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
