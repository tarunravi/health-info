export default async function handler(req, res) {
  try {
    const response = await fetch("https://api-polbq3pvdq-ue.a.run.app/api/generatePatient");
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching patient data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
