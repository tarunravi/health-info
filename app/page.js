"use client";

// Import necessary libraries
import React, { useState } from "react";
import styled from "styled-components";

// Styled components for improved styling
const Container = styled.div`
  background-color: #f5f5f5;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Card = styled.div`
  background-color: #ffffff;
  border-radius: 8px;
  padding: 20px;
  margin: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  color: #333333;
  font-size: 2rem;
  margin-bottom: 20px;
`;

const Button = styled.button`
  background-color: #4caf50;
  color: white;
  padding: 10px 20px;
  font-size: 1.2rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;

  &:hover {
    background-color: #45a049;
  }
`;

// Functional component with improved UI
export default function Home() {
  const [patientData, setPatientData] = useState(null);
  const [step, setStep] = useState(0);
  const [results, setResults] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [riskAssessment, setRiskAssessment] = useState(null);

  const generatePatient = async () => {
    try {
      const response = await fetch("/api/generatePatient");
      const data = await response.json();
      console.log("Patient data:", data);
      setPatientData(data);
      setStep(1);
    } catch (error) {
      console.error("Error fetching patient data:", error);
    }
  };

  const predictHeartDisease = async () => {
    try {
      const response = await fetch("/api/heartDisease", {
        method: "POST",
        body: JSON.stringify(patientData),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      const heartDiseasePrediction = Boolean(data.prediction);
      setResults(heartDiseasePrediction);
      setPrediction(data.prediction);
      setRiskAssessment(data.risk_assessment);

      setStep(2);
    } catch (error) {
      console.error("Error predicting heart disease:", error);
    }
  };

  const renderHeartDiseaseMessage = () => {
    return (
      <h2>
        {results
          ? "High likelihood of heart disease"
          : "Low likelihood of heart disease"}
      </h2>
    );
  };

  return (
    <Container>
      <Card>
        {step === 0 && (
          <>
            <Title>Generate New Patient</Title>
            <Button onClick={generatePatient}>Generate</Button>
          </>
        )}
        {step === 1 && (
          <>
            {patientData && (
              <div>
                <Title>Patient Data</Title>
                <table>
                  <tbody>
                    {Object.entries(patientData).map(([key, value]) => (
                      <tr key={key}>
                        <td>{key}</td>
                        <td>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <Button onClick={predictHeartDisease}>Predict Heart Disease</Button>
          </>
        )}
        {step === 2 && (
          <>
            {renderHeartDiseaseMessage()}
            <h1>FHIR Risk Assessment:</h1>
            <pre>{JSON.stringify(riskAssessment, null, 2)}</pre>
          </>
        )}
      </Card>
    </Container>
  );
}
