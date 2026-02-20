const fs = require("fs");
const pdfParse = require("pdf-parse");

// Simple ATS scoring based on keywords
const calculateATSScore = (text) => {
  const keywords = [
    "python", "java", "react", "node", "express", "mongodb",
    "machine learning", "data analysis", "ai", "sql", "git",
    "cloud", "aws", "docker", "api", "javascript"
  ];

  let score = 0;
  const lowerText = text.toLowerCase();

  keywords.forEach((keyword) => {
    if (lowerText.includes(keyword)) {
      score += 5;
    }
  });

  return Math.min(score, 100);
};

exports.uploadResume = async (req, res) => {
  try {
    // 1️⃣ Validate file
    if (!req.file) {
      return res.status(400).json({ error: "No resume file uploaded" });
    }

    const filePath = req.file.path;

    // 2️⃣ Read PDF file
    const fileBuffer = fs.readFileSync(filePath);

    // 3️⃣ Extract text from PDF
    const pdfData = await pdfParse(fileBuffer);
    const resumeText = pdfData.text || "";

    // 4️⃣ Generate ATS Score
    const atsScore = calculateATSScore(resumeText);

    // 5️⃣ Create analysis report
    const analysis = `
📊 AI Analysis Report

ATS Score: ${atsScore}/100

🔎 Resume Summary:
Your resume was successfully parsed and analyzed.

📌 Suggestions:
- Add more measurable achievements
- Include technical keywords like Python, SQL, Cloud, APIs
- Highlight projects with impact and numbers
- Ensure proper section headings (Skills, Projects, Experience)
- Add GitHub and LinkedIn links if missing

🧠 Keyword Match Insights:
Detected common tech keywords based on resume content.
Improving keyword density can increase ATS score.

📄 Extracted Text Length: ${resumeText.length} characters
`;

    // 6️⃣ Send response
    res.status(200).json({ analysis });

  } catch (error) {
    console.error("Resume Upload Error:", error);
    res.status(500).json({
      error: "Server error while analyzing resume",
    });
  }
};