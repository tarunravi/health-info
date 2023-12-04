// pages/api/heartDisease.js
export default async function handler(req, res) {
  try {
    const response = await fetch("https://api-polbq3pvdq-ue.a.run.app/api/heartDisease", {
      method: "POST",
      body: JSON.stringify(req.body),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error predicting heart disease:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
