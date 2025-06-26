import os
import logging
import random
import json
from datetime import datetime
from bson.objectid import ObjectId
from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
from flask_pymongo import PyMongo
from werkzeug.security import generate_password_hash, check_password_hash

# Set up logging
logging.basicConfig(level=logging.DEBUG)

# Create Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev_secret_key")

# MongoDB Configuration
mongodb_uri = os.environ.get("MONGODB_URI", "mongodb://localhost:27017/legal_prediction")
print(f"DEBUG: MongoDB URI: {mongodb_uri}")

# Ensure proper MongoDB URI format
if mongodb_uri and "mongodb+srv" in mongodb_uri:
    app.config["MONGO_URI"] = mongodb_uri
else:
    app.config["MONGO_URI"] = "mongodb://localhost:27017/legal_prediction"
    print("DEBUG: Using local MongoDB fallback")

try:
    mongo = PyMongo(app)
    mongo.db.command('ping')
    print("DEBUG: MongoDB connection successful")
except Exception as e:
    print(f"ERROR: MongoDB connection failed: {str(e)}")
    from unittest.mock import MagicMock
    mongo = MagicMock()
    mongo.db.users = MagicMock()
    mongo.db.cases = MagicMock()
    mongo.db.predictions = MagicMock()
    mongo.db.users.find_one.return_value = None
    mongo.db.users.insert_one.return_value = MagicMock(inserted_id="mock_id")
    mongo.db.cases.insert_one.return_value = MagicMock(inserted_id="mock_case_id")
    mongo.db.predictions.insert_one.return_value = None

    class MockObjectId:
        def __call__(self, id_str):
            return id_str

    global ObjectId
    ObjectId = MockObjectId()

    print("DEBUG: Using mock MongoDB for development")

from prediction_utils import predict_outcome, get_case_precedents, predict_numerical_values
from explainable_ai import generate_explanation, generate_shap_visualization, generate_lime_explanation

def is_logged_in():
    return 'user_id' in session

def get_current_user():
    if not is_logged_in():
        return None
    return mongo.db.users.find_one({'_id': ObjectId(session['user_id'])})

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        user = mongo.db.users.find_one({'email': email})

        if user and check_password_hash(user['password_hash'], password):
            session['user_id'] = str(user['_id'])
            session['username'] = user['username']
            session['is_lawyer'] = user['is_lawyer']
            next_page = request.args.get('next')
            return redirect(next_page or url_for('index'))
        else:
            flash('Login unsuccessful. Please check your email and password.', 'danger')

    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        is_lawyer = 'is_lawyer' in request.form

        if mongo.db.users.find_one({'email': email}):
            flash('Email already registered.', 'warning')
            return redirect(url_for('register'))

        new_user = {
            'username': username,
            'email': email,
            'password_hash': generate_password_hash(password),
            'is_lawyer': is_lawyer,
            'created_at': datetime.utcnow()
        }

        user_id = mongo.db.users.insert_one(new_user).inserted_id

        flash('Registration successful. Please log in.', 'success')
        return redirect(url_for('login'))

    return render_template('register.html')

@app.route('/logout')
def logout():
    session.clear()
    flash('You have been logged out.', 'info')
    return redirect(url_for('index'))

@app.route('/citizen')
def citizen_view():
    if not is_logged_in():
        flash('Please log in to access this page.', 'warning')
        return redirect(url_for('login', next=request.url))
    return render_template('citizen_view.html')

@app.route('/lawyer')
def lawyer_view():
    if not is_logged_in():
        flash('Please log in to access this page.', 'warning')
        return redirect(url_for('login', next=request.url))

    if not session.get('is_lawyer'):
        flash('You need to be registered as a legal professional to access this page.', 'warning')
        return redirect(url_for('index'))

    return render_template('lawyer_view.html')

@app.route('/predict', methods=['POST'])
def predict():
    case_type = request.form.get('case_type')
    case_details = request.form.get('case_details')
    facts = request.form.get('facts')
    arguments = request.form.get('arguments') or ""
    applicable_laws = request.form.get('applicable_laws') or ""
    user_type = request.form.get('user_type', 'citizen')

    combined_text = f"Case Type: {case_type}\nCase Details: {case_details}\nFacts: {facts}\nArguments: {arguments}\nApplicable Laws: {applicable_laws}"

    outcome, probability = predict_outcome(combined_text)
    explanation = f"The outcome is predicted based on a fine-tuned legal BERT model with confidence score of {probability}."

    relevant_cases = get_case_precedents(combined_text, case_type)
    numerical_predictions = predict_numerical_values(combined_text, case_type)

    shap_visualization = generate_shap_visualization(combined_text)
    lime_explanation = generate_lime_explanation(combined_text)

    if is_logged_in():
        user_id = session['user_id']

        new_case = {
            'user_id': ObjectId(user_id),
            'case_type': case_type,
            'case_details': case_details,
            'facts': facts,
            'arguments': arguments,
            'applicable_laws': applicable_laws,
            'created_at': datetime.utcnow()
        }

        case_id = mongo.db.cases.insert_one(new_case).inserted_id

        new_prediction = {
            'case_id': case_id,
            'predicted_outcome': outcome,
            'confidence': probability,
            'numerical_predictions': str(numerical_predictions),
            'explanation': explanation,
            'created_at': datetime.utcnow()
        }

        mongo.db.predictions.insert_one(new_prediction)
        session['last_case_id'] = str(case_id)

    else:
        session['last_prediction'] = {
            'case_type': case_type,
            'outcome': outcome,
            'probability': probability,
            'numerical_predictions': numerical_predictions,
            'relevant_cases': relevant_cases,
            'explanation': explanation,
            'shap_visualization': shap_visualization,
            'lime_explanation': lime_explanation
        }

    return redirect(url_for('results'))

@app.route('/results')
def results():
    if is_logged_in() and session.get('last_case_id'):
        case_id = session.get('last_case_id')
        user_id = session['user_id']

        case = mongo.db.cases.find_one({
            '_id': ObjectId(case_id),
            'user_id': ObjectId(user_id)
        })

        if not case:
            flash('Case not found.', 'warning')
            return redirect(url_for('index'))

        prediction = mongo.db.predictions.find_one({'case_id': ObjectId(case_id)})

        if not prediction:
            flash('Prediction not found.', 'warning')
            return redirect(url_for('index'))

        result_data = {
            'case_type': case['case_type'],
            'outcome': prediction['predicted_outcome'],
            'probability': prediction['confidence'],
            'numerical_predictions': eval(prediction['numerical_predictions']),
            'explanation': prediction['explanation'],
            'relevant_cases': get_case_precedents(case['case_details'], case['case_type']),
            'shap_visualization': generate_shap_visualization(case['case_details']),
            'lime_explanation': generate_lime_explanation(case['case_details'])
        }

        session.pop('last_case_id', None)

    elif 'last_prediction' in session:
        result_data = session['last_prediction']

    else:
        flash('No prediction data found. Please submit a case first.', 'warning')
        return redirect(url_for('index'))

    print(f"Probability passed to template: {result_data.get('probability')}")
    return render_template('results.html', result=result_data)

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/my_predictions')
def my_predictions():
    if not is_logged_in():
        flash('Please log in to view your predictions.', 'warning')
        return redirect(url_for('login', next=request.url))

    user_id = session['user_id']

    try:
        cases = list(mongo.db.cases.find({'user_id': ObjectId(user_id)}).sort('created_at', -1))
        case_ids = [case['_id'] for case in cases]
        predictions = {p['case_id']: p for p in mongo.db.predictions.find({'case_id': {'$in': case_ids}})}

        results = []
        for case in cases:
            prediction = predictions.get(case['_id'])
            if prediction:
                results.append({
                    'case_type': case['case_type'],
                    'case_details': case['case_details'],
                    'created_at': case['created_at'],
                    'predicted_outcome': prediction['predicted_outcome'],
                    'confidence': prediction['confidence'],
                    'numerical_predictions': eval(prediction['numerical_predictions']),
                    'case_id': str(case['_id'])
                })
    except Exception as e:
        logging.error(f"Error fetching predictions: {str(e)}")
        flash("Failed to load your predictions. Please try again later.", "danger")
        return redirect(url_for('index'))

    return render_template('my_predictions.html', results=results)

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_server_error(e):
    return render_template('500.html'), 500

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)
