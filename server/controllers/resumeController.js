const fs = require("fs");
const pdfParse = require("pdf-parse");

// Keyword categories for scoring & suggestions
const keywordCategories = {
  languages: ["python", "java", "c++", "javascript", "sql"],
  web: ["react", "node", "express", "html", "css", "rest", "api"],
  ai_ml: [
    "machine learning",
    "nlp",
    "computer vision",
    "opencv",
    "scikit-learn",
    "pandas",
    "numpy",
    "deep learning",
  ],
  tools: ["git", "github", "docker", "aws", "cloud", "power bi"],
};

// 🔢 Calculate ATS Score dynamically
const calculateATSScore = (text) => {
  let score = 0;
  const lowerText = text.toLowerCase();

  Object.values(keywordCategories)
    .flat()
    .forEach((keyword) => {
      if (lowerText.includes(keyword)) {
        score += 3; // weight per keyword
      }
    });

  return Math.min(score, 100);
};

// 🤖 Generate automated suggestions based on missing elements
const generateSuggestions = (text) => {
  const lowerText = text.toLowerCase();
  const suggestions = [];

  // Check missing skill categories
  Object.entries(keywordCategories).forEach(([category, keywords]) => {
    const found = keywords.some((k) => lowerText.includes(k));
    if (!found) {
      suggestions.push(`Consider adding more ${category.toUpperCase()} related skills.`);
    }
  });

  // Check measurable achievements
  if (!/\d+%|\d+\+|\d+\s*(users|projects|models|accuracy)/i.test(text)) {
    suggestions.push("Add measurable achievements with numbers or percentages.");
  }

  // Check GitHub
  if (!lowerText.includes("github")) {
    suggestions.push("Include a GitHub profile link to showcase your projects.");
  }

  // Check LinkedIn
  if (!lowerText.includes("linkedin")) {
    suggestions.push("Include a LinkedIn profile link for professional visibility.");
  }

  // Check Projects section
  if (!lowerText.includes("projects")) {
    suggestions.push("Add a dedicated Projects section to highlight practical work.");
  }

  // Fallback suggestion if resume already strong
  if (suggestions.length === 0) {
    suggestions.push("Great resume! Consider adding more quantified achievements for extra impact.");
  }

  return suggestions;
};

// 🚀 Main Controller
exports.uploadResume = async (req, res) => {
  try {
    // 1️⃣ Validate file
    if (!req.file) {
      return res.status(400).json({ error: "No resume file uploaded" });
    }

    // 2️⃣ Read uploaded PDF
    const fileBuffer = fs.readFileSync(req.file.path);

    // 3️⃣ Extract text from PDF
    const pdfData = await pdfParse(fileBuffer);
    const resumeText = pdfData.text || "";

    // 4️⃣ Generate score & suggestions
    const atsScore = calculateATSScore(resumeText);
    const suggestions = generateSuggestions(resumeText);

    // 5️⃣ Build analysis report dynamically
    const analysis = `
📊 AI Analysis Report

ATS Score: ${atsScore}/100

🔎 Resume Summary:
Your resume was successfully parsed and analyzed using automated keyword and content evaluation.

📌 Automated Suggestions:
${suggestions.map((s) => `- ${s}`).join("\n")}

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