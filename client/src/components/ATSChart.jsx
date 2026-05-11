import React from "react";

import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const COLORS = [
    "#2ecc71",
    "#3498db",
    "#f39c12",
    "#9b59b6",
    "#e74c3c",
];

const ATSChart = ({ sectionScores }) => {
    const data = [
        {
            name: "Skills",
            value: sectionScores.skills,
        },
        {
            name: "Experience",
            value: sectionScores.experience,
        },
        {
            name: "Projects",
            value: sectionScores.projects,
        },
        {
            name: "Achievements",
            value: sectionScores.achievements,
        },
        {
            name: "Formatting",
            value: sectionScores.formatting,
        },
    ];

    return (
        <div
            style={{
                width: "100%",
                height: "400px",
                background: "#fff",
                borderRadius: "16px",
                padding: "20px",
            }}
        >
            <h2
                style={{
                    marginBottom: "20px",
                    color: "#2c3e50",
                }}
            >
                📊 ATS Score Breakdown
            </h2>

            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        dataKey="value"
                        label
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                            />
                        ))}
                    </Pie>

                    <Tooltip />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ATSChart;