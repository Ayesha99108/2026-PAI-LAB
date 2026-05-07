import os
from flask import Flask, render_template, request, jsonify, redirect, url_for, session
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
from datetime import datetime
import google.genai as genai

load_dotenv()

app = Flask(__name__)
app.secret_key = "super_secret_garden_key"

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///garden_final.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# ---------------- DATABASE ----------------
class Reflection(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.Text, nullable=False)
    sentiment = db.Column(db.String(50))
    plant = db.Column(db.String(50))
    analysis = db.Column(db.Text)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

with app.app_context():
    db.create_all()

# ---------------- GENAI ----------------
api_key = os.getenv("GOOGLE_API_KEY")
if api_key:
    client = genai.Client(api_key=api_key)
else:
    client = None


def analyze_with_genai(text):
    if client is None:
        return "hope"  # Default sentiment if no API key
    prompt = f"""
Return ONLY ONE WORD emotion from this list:
joy, sadness, anger, calm, love, hope, stress, excitement, regret

Text: {text}
"""
    response = client.models.generate_content(
        model="gemini-1.5-pro",
        contents=prompt
    )
    return response.text.strip().lower()


# ---------------- ROUTES ----------------
@app.route('/')
def index():
    return render_template('index.html')


@app.route('/garden_view')
def garden_view():
    return render_template('garden.html')


@app.route('/stats')
def stats():
    total = Reflection.query.count()
    return render_template('stats.html', total=total)


@app.route('/contact')
def contact():
    return render_template('contact.html')


# ---------------- LOGIN ----------------
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        session['user'] = request.form.get('username')
        return redirect(url_for('index'))
    return render_template('login.html')


@app.route('/logout')
def logout():
    session.pop('user', None)
    return redirect(url_for('login'))


# ---------------- HISTORY ----------------
@app.route('/history')
def history():
    reflections = Reflection.query.order_by(Reflection.timestamp.desc()).all()

    return jsonify([
        {
            'id': r.id,
            'text': r.text,
            'sentiment': r.sentiment,
            'plant': r.plant,
            'analysis': r.analysis,
            'timestamp': r.timestamp.strftime('%Y-%m-%d %I:%M %p')
        }
        for r in reflections
    ])


# ---------------- ANALYZE (FIXED) ----------------
@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json()

    if not data:
        return jsonify({'error': 'No JSON received'}), 400

    text = data.get('reflection', '').strip()

    if not text:
        return jsonify({'error': 'Empty reflection'}), 400

    try:
        # AI SENTIMENT
        sentiment_raw = analyze_with_genai(text)

        sentiment_map = {
            "joy": "joy",
            "sadness": "sadness",
            "anger": "anger",
            "calm": "calm",
            "love": "love",
            "stress": "stress",
            "excitement": "excitement",
            "regret": "regret",
            "hope": "hope"
        }

        sentiment = sentiment_map.get(sentiment_raw, "hope")

        plant_map = {
            'joy': 'sunflower',
            'love': 'rose',
            'calm': 'bamboo',
            'sadness': 'weeping willow',
            'anger': 'cactus',
            'stress': 'fern',
            'hope': 'sprout',
            'excitement': 'hibiscus',
            'regret': 'wilted rose'
        }

        plant = plant_map.get(sentiment, 'sprout')

        new_reflection = Reflection(
            text=text,
            sentiment=sentiment,
            plant=plant,
            analysis=sentiment_raw
        )

        db.session.add(new_reflection)
        db.session.commit()

        return jsonify({
            'text': text,
            'sentiment': sentiment,
            'plant': plant,
            'analysis': sentiment_raw,
            'timestamp': new_reflection.timestamp.strftime('%Y-%m-%d %I:%M %p')
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ---------------- RUN ----------------
if __name__ == '__main__':
    app.run(debug=True, port=5001)