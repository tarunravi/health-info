from flask import Flask, request
import pandas as pd
from datetime import datetime
import joblib
import json

# import subprocess
# import sys

# subprocess.call([sys.executable, '-m', 'pip', 'install', "scikit-learn"])

import sklearn


app = Flask(__name__)

# Endpoint to handle the POST request
@app.route('/api/generatePatient', methods=['GET'])
def generatePatient():
    # Get the CSV file path from the request
    file_path = r"synthea-pt30k-final.csv"

    df = pd.read_csv(file_path, nrows=5000)
    df.dropna(subset=['C-2093-3'], inplace=True)
    df.dropna(subset=['C-8867-4'], inplace=True)
    df.dropna(subset=['C-8462-4'], inplace=True)
    df.dropna(subset=['C-8480-6'], inplace=True)
    cols = ["C-424144002", "C-263495000", "C-999199", "C-8462-4", "C-8480-6", "C-2093-3", "C-999299", "C-8867-4", "C-999699", "C-999599", "C-999499"]       
    df = df[cols]
    df['trestbps'] = df['C-8480-6'] - df['C-8462-4']
    # Remove the "Diastolic" and "Systolic" columns
    df.drop(['C-8462-4', 'C-8480-6'], axis=1, inplace=True)
    column_mapping = {
        'C-424144002': 'age',
        'C-263495000': 'sex',
        'C-999199': 'CP',
        'C-2093-3': 'cholesterol',
        'C-999299': 'restecg',
        'C-8867-4': 'thalach',
        'C-999699': 'oldpeak',
        'C-999599': 'slope',
        'C-999499': 'thal'
    }
    for key in column_mapping.keys():
        df.rename(columns={key: column_mapping[key]}, inplace=True)
    df['sex'] = df['sex'].str.upper()
    random_row = df.sample(n=1)
    json_data = random_row.to_json(orient='records')
    return json.loads(json_data[1:-1])

@app.route('/api/heartDisease', methods=['POST'])
def predict_heart_disease():
    patient_data = request.get_json()
    df = pd.DataFrame(patient_data, index=[0])

    # Define the desired column order
    desired_columns_order = ['age', 'sex', 'CP', 'trestbps', 'cholesterol', 'restecg', 'thalach', 'oldpeak', 'slope', 'thal']

    # Reorder the columns
    df = df[desired_columns_order]
    row = df.iloc[0].tolist()
    row.insert(7, 1)
    print(row)
    first_row_values = []
    for item in row:
        if item == "F":
            item = 0
        elif item == "M":
            item = 1
        item = int(item)
        first_row_values.append(item)

    with open(r"heart_model", "rb") as joblib_model:
        model = joblib.load(joblib_model)

    first_row_values = [first_row_values, first_row_values]
    
    prediction = model.predict(first_row_values)[0]
    if prediction == 0:
        risk = "High risk of heart disease"
    else:
        risk = "Low risk of heart disease"

    risk_assessment_json = {
        "resourceType": "RiskAssessment",
        "id": "example-risk-assessment",
        "meta": {
            "profile": [
                "https://fhir-ru.github.io/riskassessment.html"
            ]
        },
        "status": "final",
        "subject": {
            "reference": "Patient"
        },
        "date": "2023-12-03T12:00:00Z",
        "code": {
            "coding": [
                {
                    "system": "http://loinc.org",
                    "code": "8867-4",
                    "display": "Heart disease risk assessment"
                }
            ],
            "text": "Heart Disease Risk Assessment"
        },
        "performer": {
            "reference": "Practitioner"
        },
        "prediction": [
            {
                "outcome": {
                    "coding": [
                        {
                            "system": "http://snomed.info/sct",
                            "code": "427041000124105",
                            "display": risk
                        }
                    ],
                    "text": risk
                },
                "probabilityDecimal": str(prediction),
            }
        ]
    }
    risk_assessment_json["date"] = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
    s = str({"prediction": str(prediction == 0), "risk_assessment": risk_assessment_json})
    s = s.replace("\'", "\"")
    return json.loads(s)

if __name__ == '__main__':
    app.run(debug=True)