import React, { useState } from "react";
import { uploadResume } from "../services/api";
import ATSChart from "./ATSChart";

const UploadResume = () => {
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);

  const [score, setScore] = useState(null);
  const [jdScore, setJdScore] = useState(null);

  const [matchedSkills, setMatchedSkills] = useState([]);
  const [missingJDSkills, setMissingJDSkills] = useState([]);

  const [jobDescription, setJobDescription] = useState("");
  const [sectionScores, setSectionScores] = useState(null);

  const formatAnalysis = (data) => {
    return `
🚀 AI Resume Intelligence Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 OVERALL ATS SCORE
${data.atsScore}/100

🎯 JOB DESCRIPTION MATCH SCORE
${data.jdMatchScore || 0}%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ STRONG AREAS

${Object.entries(data.presentSkills)
        .filter(([_, skills]) => skills.length > 0)
        .map(
          ([category, skills]) =>
            `• ${category.toUpperCase()}
  ${skills.join(", ")}`
        )
        .join("\n\n")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ MISSING INDUSTRY SKILLS

${Object.entries(data.missingSkills)
        .filter(([_, skills]) => skills.length > 0)
        .map(
          ([category, skills]) =>
            `• ${category.toUpperCase()}
  ${skills.slice(0, 5).join(", ")}`
        )
        .join("\n\n")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🤖 AI CAREER INSIGHTS

${data.aiInsights ||
      "Your profile shows strong technical potential with scope for improvement in production-level engineering skills and cloud technologies."
      }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 AI RESUME IMPROVEMENT SUGGESTIONS

${data.smartSuggestions?.length > 0
        ? data.smartSuggestions
          .map((s, index) => `${index + 1}. ${s}`)
          .join("\n\n")
        : "1. Add more production-level projects.\n\n2. Include cloud and deployment experience.\n\n3. Highlight measurable achievements in projects."
      }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 PROFILE SUMMARY

Your resume demonstrates solid technical foundations. However, adding production-level engineering tools, deployment experience, cloud technologies, and quantified achievements can significantly improve recruiter visibility and ATS ranking.

📄 Resume Length: ${data.extractedTextLength} characters
`;
  };

  const handleUpload = async () => {
    if (!file) {
      return alert("Please select a resume PDF");
    }

    const formData = new FormData();

    formData.append("resume", file);
    formData.append("jobDescription", jobDescription);

    try {
      setLoading(true);

      setAnalysis("");
      setScore(null);
      setJdScore(null);

      setMatchedSkills([]);
      setMissingJDSkills([]);

      const data = await uploadResume(formData);

      if (data && data.atsScore !== undefined) {
        setScore(data.atsScore);

        setJdScore(data.jdMatchScore);

        setMatchedSkills(data.matchedSkills || []);

        setMissingJDSkills(data.missingJDSkills || []);

        setAnalysis(formatAnalysis(data));
        setSectionScores(data.sectionScores);
      } else if (data && data.error) {
        alert(data.error);
      } else {
        alert("Unexpected response from server");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error analyzing resume");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.heading}>🧠 AI Resume Analyzer</h1>

        <div style={styles.dashboard}>
          {/* LEFT PANEL */}
          <div style={styles.leftPanel}>
            <div style={styles.uploadBox}>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setFile(e.target.files[0])}
                style={styles.fileInput}
              />

              <textarea
                placeholder="Paste Job Description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows="10"
                style={styles.textarea}
              />

              <button onClick={handleUpload} style={styles.button}>
                {loading ? "Analyzing..." : "Analyze Resume"}
              </button>
            </div>

            {score !== null && (
              <div style={styles.scoreContainer}>
                <h2 style={styles.scoreTitle}>
                  📊 ATS Score: {score}/100
                </h2>

                <div style={styles.progressBar}>
                  <div
                    style={{
                      ...styles.progressFill,
                      width: `${score}%`,
                      background:
                        score > 75
                          ? "#2ecc71"
                          : score > 50
                            ? "#f39c12"
                            : "#e74c3c",
                    }}
                  ></div>
                </div>
              </div>
            )}

            {jdScore !== null && (
              <div style={styles.jdContainer}>
                <h2 style={styles.scoreTitle}>
                  🎯 JD Match Score: {jdScore}%
                </h2>

                <div style={styles.progressBar}>
                  <div
                    style={{
                      ...styles.progressFill,
                      width: `${jdScore}%`,
                      background:
                        jdScore > 75
                          ? "#2ecc71"
                          : jdScore > 50
                            ? "#f39c12"
                            : "#e74c3c",
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT PANEL */}
          <div style={styles.rightPanel}>
            {matchedSkills.length > 0 && (
              <div style={styles.skillCard}>
                <h3 style={styles.cardTitle}>
                  ✅ Matched Skills
                </h3>

                <ul>
                  {matchedSkills.map((skill, index) => (
                    <li key={index} style={styles.skillItem}>
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {missingJDSkills.length > 0 && (
              <div style={styles.skillCard}>
                <h3 style={styles.cardTitle}>
                  ❌ Missing JD Skills
                </h3>

                <ul>
                  {missingJDSkills.map((skill, index) => (
                    <li key={index} style={styles.skillItem}>
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {sectionScores && (
              <ATSChart sectionScores={sectionScores} />
            )}

            {analysis && (
              <div style={styles.analysisCard}>
                <h2 style={styles.analysisTitle}>
                  📋 AI Analysis Report
                </h2>

                <pre style={styles.analysisText}>
                  {analysis}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    background: "linear-gradient(135deg, #1f1c2c, #928dab)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px",
    boxSizing: "border-box",
    fontFamily: "Arial, sans-serif",
  },

  container: {
    width: "95%",
    maxWidth: "1600px",
    minHeight: "90vh",
    background: "#ffffff",
    padding: "50px",
    borderRadius: "24px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
  },

  heading: {
    textAlign: "center",
    color: "#2c3e50",
    marginBottom: "30px",
    fontSize: "48px",
    fontWeight: "bold",
  },

  dashboard: {
    display: "grid",
    gridTemplateColumns: "1fr 1.2fr",
    gap: "30px",
    alignItems: "start",
  },

  leftPanel: {
    display: "flex",
    flexDirection: "column",
    gap: "25px",
  },

  rightPanel: {
    display: "flex",
    flexDirection: "column",
    gap: "25px",
  },

  uploadBox: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    background: "#f8f9fa",
    padding: "25px",
    borderRadius: "16px",
    border: "1px solid #ddd",
  },

  fileInput: {
    padding: "14px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    width: "100%",
    backgroundColor: "#fff",
    color: "#333",
  },

  textarea: {
    width: "100%",
    padding: "16px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    resize: "none",
    fontSize: "15px",
    outline: "none",
  },

  button: {
    padding: "16px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    color: "#fff",
    fontSize: "18px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  scoreContainer: {
    background: "#f8f9fa",
    padding: "25px",
    borderRadius: "16px",
    border: "1px solid #ddd",
  },

  jdContainer: {
    background: "#f8f9fa",
    padding: "25px",
    borderRadius: "16px",
    border: "1px solid #ddd",
  },

  scoreTitle: {
    color: "#111",
    fontSize: "30px",
    fontWeight: "bold",
    marginBottom: "12px",
  },

  progressBar: {
    width: "100%",
    height: "24px",
    background: "#ddd",
    borderRadius: "12px",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: "12px",
    transition: "width 0.5s ease-in-out",
  },

  skillCard: {
    background: "#f8f9fa",
    padding: "25px",
    borderRadius: "16px",
    border: "1px solid #ddd",
  },

  cardTitle: {
    color: "#111",
    marginBottom: "15px",
    fontSize: "24px",
    fontWeight: "bold",
  },

  skillItem: {
    color: "#111",
    fontSize: "18px",
    marginBottom: "10px",
    fontWeight: "500",
  },

  analysisCard: {
    background: "#f4f6f8",
    padding: "25px",
    borderRadius: "16px",
    border: "1px solid #ddd",
    maxHeight: "700px",
    overflowY: "auto",
  },

  analysisTitle: {
    color: "#2c3e50",
    marginBottom: "15px",
    fontSize: "28px",
    fontWeight: "bold",
  },

  analysisText: {
    whiteSpace: "pre-wrap",
    color: "#333",
    lineHeight: "1.8",
    fontSize: "15px",
  },
};

export default UploadResume;