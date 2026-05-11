const fs = require("fs");
const pdfParse = require("pdf-parse");
const extractSkills = require("../utils/extractSkills");
const domains = require("../data/domains");

// Skill taxonomy with weights
const skillTaxonomy = {
    programming: {
        weight: 5,
        skills: ["python", "java", "c++", "javascript", "sql"],
    },

    web: {
        weight: 4,
        skills: ["react", "node", "express", "html", "css", "api", "rest"],
    },

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

    databases: {
        weight: 4,
        skills: ["mongodb", "mysql", "postgresql"],
    },

    tools: {
        weight: 3,
        skills: [
            "git",
            "github",
            "docker",
            "aws",
            "cloud",
            "power bi",
            "tableau",
        ],
    },

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

// Smart Skill Alias Mapping
const skillAliases = {
    javascript: ["react", "node", "express"],
    backend: ["node", "express", "api"],
    api: ["express", "rest"],
    cloud: ["aws", "docker", "deployment"],
    frontend: ["react", "html", "css"],
    database: ["mongodb", "mysql", "postgresql"],
    scalable: ["node", "express"],
    secure: ["jwt", "authentication", "api"],
};
const detectDomain = (text) => {
    for (const [domain, data] of Object.entries(domains)) {
        const matched = data.keywords.some((keyword) =>
            text.includes(keyword)
        );

        if (matched) {
            return domain;
        }
    }

    return "general";
};

// Skill Analysis
const analyzeSkills = (
    text,
    taxonomy = skillTaxonomy
) => {
    let totalScore = 0;

    let maxScore = 0;

    const presentSkills = {};

    const missingSkills = {};

    Object.entries(taxonomy).forEach(
        ([category, data]) => {
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
        }
    );

    return {
        score: Math.round(
            (totalScore / maxScore) * 40
        ),

        presentSkills,

        missingSkills,
    };
};

// Experience Score
const evaluateExperience = (text) => {
    let score = 0;

    if (/(intern|internship)/i.test(text)) score += 10;

    if (/(experience|worked at|company)/i.test(text)) score += 10;

    return score;
};

// Project Score
const evaluateProjects = (text) => {
    let score = 0;

    const projectMatches = text.match(/project/g) || [];

    score += Math.min(projectMatches.length * 4, 15);

    if (/(developed|built|designed|implemented)/i.test(text)) score += 5;

    return score;
};

// Achievement Score
const evaluateAchievements = (text) => {
    let score = 0;

    if (/\d+%/.test(text)) score += 5;

    if (/\d+\+/.test(text)) score += 5;

    if (/(accuracy|users|latency|performance)/i.test(text)) score += 5;

    return score;
};

// Formatting Score
const evaluateFormatting = (text) => {
    let score = 0;

    const sections = ["education", "skills", "projects", "experience"];

    sections.forEach((sec) => {
        if (text.includes(sec)) score += 2.5;
    });

    return score;
};

// Smart Suggestions Engine
const generateDynamicSuggestions = (missingSkills, text) => {
    const suggestions = [];

    Object.entries(missingSkills).forEach(([category, skills]) => {
        if (skills.length > 0) {
            suggestions.push(
                `Consider adding ${category.toUpperCase()} skills: ${skills
                    .slice(0, 4)
                    .join(", ")}`
            );
        }
    });

    if (!/(github|portfolio)/i.test(text)) {
        suggestions.push(
            "Add GitHub or portfolio links to improve recruiter credibility."
        );
    }

    if (!/\d+%|\d+\+/.test(text)) {
        suggestions.push(
            "Include quantified achievements such as performance improvements or project impact metrics."
        );
    }

    if (!/(aws|docker|deployment|cloud)/i.test(text)) {
        suggestions.push(
            "Mention cloud or deployment technologies like AWS and Docker for stronger ATS ranking."
        );
    }

    if (!/(data structures|algorithms)/i.test(text)) {
        suggestions.push(
            "Highlight DSA and problem-solving skills for stronger technical depth."
        );
    }

    return suggestions;
};

// Main Upload Controller
exports.uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: "No resume file uploaded",
            });
        }

        // Read PDF
        const buffer = fs.readFileSync(req.file.path);

        const pdfData = await pdfParse(buffer);

        const text = pdfData.text.toLowerCase();

        // Detect Resume Domain
        const detectedDomain = detectDomain(text);

        console.log("Detected Domain:", detectedDomain);
        // Job Description
        const jobDescription = req.body.jobDescription || "";

        // Extract Skills
        const resumeSkillsFlat = extractSkills(text);

        const jdSkills = extractSkills(jobDescription.toLowerCase());

        // SMART JD MATCHING
        const matchedSkills = [];

        const missingJDSkills = [];

        jdSkills.forEach((skill) => {
            const lowerSkill = skill.toLowerCase();

            const directMatch = resumeSkillsFlat.some((resumeSkill) =>
                resumeSkill.toLowerCase().includes(lowerSkill)
            );

            const aliasMatch =
                skillAliases[lowerSkill] &&
                skillAliases[lowerSkill].some((alias) =>
                    resumeSkillsFlat.includes(alias)
                );

            if (directMatch || aliasMatch) {
                matchedSkills.push(skill);
            } else {
                missingJDSkills.push(skill);
            }
        });

        // JD Score
        const jdMatchScore =
            jdSkills.length > 0
                ? Math.round(
                    (matchedSkills.length / jdSkills.length) * 100
                )
                : 0;

        // ATS Analysis
        const activeTaxonomy =
            domains[detectedDomain]?.taxonomy || skillTaxonomy;

        const skillAnalysis =
            analyzeSkills(text, activeTaxonomy);
        const experienceScore = evaluateExperience(text);

        const projectScore = evaluateProjects(text);

        const achievementScore = evaluateAchievements(text);

        const formattingScore = evaluateFormatting(text);

        // Final ATS Score
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

        // Final Response
        const result = {
            detectedDomain,
            atsScore,

            jdMatchScore,

            matchedSkills,

            missingJDSkills,

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

        res.status(500).json({
            error: "Server error while analyzing resume",
        });
    }
};