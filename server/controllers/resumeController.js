const fs = require("fs");
const path = require("path");

exports.uploadResume = async (req, res) => {
  try {
    // Check file received
    if (!req.file) {
      return res.status(400).json({ error: "No resume file uploaded" });
    }

    console.log("File received:", req.file.filename);

    // For now return dummy analysis (to confirm backend works)
    const analysisText = "Resume uploaded successfully. Analysis will appear here.";

    return res.status(200).json({
      analysis: analysisText,
    });

  } catch (error) {
    console.error("Resume Upload Error:", error);
    return res.status(500).json({
      error: "Server error while analyzing resume",
    });
  }
};