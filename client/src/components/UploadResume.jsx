import React, { useState } from "react";
import { uploadResume } from "../services/api";

const UploadResume = () => {
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(null);

  const extractScore = (text) => {
    const match = text.match(/ATS Score:\s*(\d+)/i);
    return match ? parseInt(match[1]) : null;
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a resume PDF");

    const formData = new FormData();
    formData.append("resume", file);

    try {
      setLoading(true);
      setAnalysis(""); // clear previous result
      setScore(null);

      const data = await uploadResume(formData);

      if (data && data.analysis) {
        setAnalysis(data.analysis);
        const atsScore = extractScore(data.analysis);
        setScore(atsScore);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to analyze resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.heading}>🧠 AI Resume Analyzer</h1>

        <div style={styles.uploadBox}>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files[0])}
            style={styles.fileInput}
          />

          <button onClick={handleUpload} style={styles.button}>
            {loading ? "Analyzing..." : "Analyze Resume"}
          </button>
        </div>

        {loading && <p>⏳ Analyzing resume... please wait</p>}

        {score !== null && (
          <div style={styles.scoreContainer}>
            <h2>ATS Score: {score}/100</h2>
            <div style={styles.progressBar}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${score}%`,
                  background:
                    score > 75 ? "#2ecc71" : score > 50 ? "#f39c12" : "#e74c3c",
                }}
              ></div>
            </div>
          </div>
        )}

        {analysis && (
          <div style={styles.analysisCard}>
            <h2 style={styles.analysisTitle}>📊 AI Analysis Report</h2>
            <pre style={styles.analysisText}>{analysis}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #1f1c2c, #928dab)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Arial, sans-serif",
  },
  container: {
    width: "800px",
    background: "#ffffff",
    padding: "40px",
    borderRadius: "16px",
    boxShadow: "0 15px 40px rgba(0,0,0,0.2)",
    textAlign: "center",
  },
  heading: {
    color: "#2c3e50",
    marginBottom: "25px",
  },
  uploadBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
    gap: "20px",
  },
  fileInput: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    width: "60%",
    backgroundColor: "#f9f9f9",
    color: "#333",
  },
  button: {
    padding: "12px 20px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    color: "#fff",
    fontSize: "16px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  scoreContainer: {
    marginBottom: "20px",
    textAlign: "left",
  },
  progressBar: {
    width: "100%",
    height: "20px",
    background: "#ddd",
    borderRadius: "10px",
    overflow: "hidden",
    marginTop: "10px",
  },
  progressFill: {
    height: "100%",
    borderRadius: "10px",
    transition: "width 0.5s ease-in-out",
  },
  analysisCard: {
    marginTop: "30px",
    textAlign: "left",
    background: "#f4f6f8",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #ddd",
    maxHeight: "400px",
    overflowY: "auto",
  },
  analysisTitle: {
    color: "#2c3e50",
    marginBottom: "15px",
  },
  analysisText: {
    whiteSpace: "pre-wrap",
    color: "#333",
    lineHeight: "1.6",
    fontSize: "14px",
  },
};

export default UploadResume;