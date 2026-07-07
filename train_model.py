from flask import Flask, request, jsonify
import pandas as pd
import joblib
from flask_cors import CORS
import numpy as np

app = Flask(__name__)
CORS(app)

model = joblib.load("model.pkl")

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        
        # Create feature vector with all 30 features
        features = {}
        features['Time'] = float(data.get('Time', 0))
        features['Amount'] = float(data['Amount'])
        
        # V1-V28 PCA components (use default 0 if not provided)
        for i in range(1, 29):
            features[f'V{i}'] = float(data.get(f'V{i}', 0))
        
        df = pd.DataFrame([features])
        
        # Ensure column order matches training
        df = df[model.feature_names_in_]
        
        prediction = model.predict(df)
        probability = model.predict_proba(df)[0][1]
        
        return jsonify({
            'fraud': bool(prediction[0]),
            'confidence': round(float(probability) * 100, 2)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)
