console.log("CONTROLLER FILE LOADED");

const fs = require("fs");
const pdfParse = require("pdf-parse");
const axios = require("axios");

console.log("typeof pdfParse =", typeof pdfParse);


exports.analyzeResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const filePath = req.file.path;
        const dataBuffer = fs.readFileSync(filePath);

        // Extract text from PDF
        const pdfData = await pdfParse(dataBuffer);
        const resumeText = pdfData.text;

        if (!resumeText || resumeText.trim().length === 0) {
            return res.status(400).json({
                message: "Could not extract text from PDF"
            });
        }

        const prompt = `
Analyze this resume and provide:
1. ATS Score (0-100)
2. Missing Skills
3. Improvement Suggestions

Resume:
${resumeText}
`;

        const response = await axios.post(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
  {
    contents: [{ parts: [{ text: prompt }] }]
  }
);



        const analysis =
            response.data.candidates?.[0]?.content?.parts?.[0]?.text ||
            "No analysis generated";

        res.json({ analysis });

    } catch (error) {
        console.log("===== GEMINI FULL ERROR =====");
        console.log(error.response?.data);
        console.log(error.message);
        console.log("================================");
        res.status(500).json({ message: "Error analyzing resume" });
    }

};
