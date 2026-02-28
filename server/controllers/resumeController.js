const fs = require("fs");
const pdfParse = require("pdf-parse");

// Skill taxonomy with weights
const skillTaxonomy = {
    programming: { weight: 5, skills: ["python", "java", "c++", "javascript", "sql"] },
    web: { weight: 4, skills: ["react", "node", "express", "html", "css", "api", "rest"] },
    ai_ml: {
        weight: 6,
        skills: [
            "machine learning",
            "deep learning",
            "nlp",
            "computer vision",
            "opencv",
            "scikit-learn",
            "pandas",
            "numpy",
            "tensorflow",
            "pytorch",
        ],
    },
    databases: { weight: 4, skills: ["mongodb", "mysql", "postgresql"] },
    tools: { weight: 3, skills: ["git", "github", "docker", "aws", "cloud", "power bi", "tableau"] },
    fundamentals: {
        weight: 4,
        skills: [
            "data structures",
            "algorithms",
            "dbms",
            "operating systems",
            "computer networks",
        ],
    },
};

// Utility: count exact skill matches
const analyzeSkills = (text) => {
    let totalScore = 0;
    let maxScore = 0;
    const presentSkills = {};
    const missingSkills = {};

    Object.entries(skillTaxonomy).forEach(([category, data]) => {
        const { skills, weight } = data;
        maxScore += skills.length * weight;

        const present = [];
        const missing = [];

        skills.forEach((skill) => {
            if (text.includes(skill)) {
                present.push(skill);
                totalScore += weight;
            } else {
                missing.push(skill);
            }
        });

        presentSkills[category] = present;
        missingSkills[category] = missing;
    });

    return {
        score: Math.round((totalScore / maxScore) * 40), // 40% weight
        presentSkills,
        missingSkills,
    };
};

// Experience scoring
const evaluateExperience = (text) => {
    let score = 0;
    if (/(intern|internship)/i.test(text)) score += 10;
    if (/(experience|worked at|company)/i.test(text)) score += 10;
    return score; // 20%
};

// Project scoring with depth detection
const evaluateProjects = (text) => {
    let score = 0;
    const projectMatches = text.match(/project/g) || [];
    score += Math.min(projectMatches.length * 4, 15);

    if (/(developed|built|designed|implemented)/i.test(text)) score += 5;

    return score; // 20%
};

// Achievement scoring (quantified impact)
const evaluateAchievements = (text) => {
    let score = 0;

    if (/\d+%/.test(text)) score += 5;
    if (/\d+\+/.test(text)) score += 5;
    if (/(accuracy|users|latency|performance)/i.test(text)) score += 5;

    return score; // 15%
};

// Formatting & ATS readability
const evaluateFormatting = (text) => {
    let score = 0;
    const sections = ["education", "skills", "projects", "experience"];

    sections.forEach((sec) => {
        if (text.includes(sec)) score += 2.5;
    });

    return score; // 10%
};

// Dynamic suggestions engine
const generateDynamicSuggestions = (missingSkills, text) => {
    const suggestions = [];

    Object.entries(missingSkills).forEach(([category, skills]) => {
        if (skills.length > 0) {
            suggestions.push(
                `Consider adding ${category.toUpperCase()} skills: ${skills.slice(0, 4).join(", ")}`
            );
        }
    });

    if (!/(github|portfolio)/i.test(text)) {
        suggestions.push("Add GitHub or portfolio links for credibility.");
    }

    if (!/\d+%|\d+\+/.test(text)) {
        suggestions.push("Include quantified achievements (e.g., improved accuracy by 20%).");
    }

    if (!/(aws|docker|deployment|cloud)/i.test(text)) {
        suggestions.push("Mention deployment or cloud tools (AWS, Docker) to improve ATS ranking.");
    }

    if (!/(data structures|algorithms)/i.test(text)) {
        suggestions.push("Highlight core CS fundamentals like DSA for stronger technical depth.");
    }

    return suggestions;
};

exports.uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No resume file uploaded" });
        }

        const buffer = fs.readFileSync(req.file.path);
        const pdfData = await pdfParse(buffer);
        const text = pdfData.text.toLowerCase();

        // Skill analysis
        const skillAnalysis = analyzeSkills(text);

        // Section evaluations
        const experienceScore = evaluateExperience(text);
        const projectScore = evaluateProjects(text);
        const achievementScore = evaluateAchievements(text);
        const formattingScore = evaluateFormatting(text);

        // Total ATS Score
        const atsScore = Math.min(
            skillAnalysis.score +
                experienceScore +
                projectScore +
                achievementScore +
                formattingScore,
            100
        );

        // Suggestions
        const suggestions = generateDynamicSuggestions(
            skillAnalysis.missingSkills,
            text
        );

        // Dynamic final analysis JSON (no prebuilt template)
        const result = {
            atsScore,
            sectionScores: {
                skills: skillAnalysis.score,
                experience: experienceScore,
                projects: projectScore,
                achievements: achievementScore,
                formatting: formattingScore,
            },
            presentSkills: skillAnalysis.presentSkills,
            missingSkills: skillAnalysis.missingSkills,
            suggestions,
            extractedTextLength: text.length,
        };

        res.status(200).json(result);
    } catch (error) {
        console.error("Resume Upload Error:", error);
        res.status(500).json({ error: "Server error while analyzing resume" });
    }
};
