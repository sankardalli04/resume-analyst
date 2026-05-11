const domains = {
    software: {
        keywords: [
            "react",
            "node",
            "mongodb",
            "python",
            "aws",
        ],

        taxonomy: {
            programming: {
                weight: 5,
                skills: [
                    "python",
                    "java",
                    "javascript",
                    "c++",
                ],
            },

            web: {
                weight: 5,
                skills: [
                    "react",
                    "node",
                    "express",
                    "html",
                    "css",
                ],
            },

            cloud: {
                weight: 5,
                skills: [
                    "aws",
                    "docker",
                    "kubernetes",
                ],
            },
        },
    },

    instrumentation: {
        keywords: [
            "plc",
            "scada",
            "instrumentation",
            "control systems",
        ],

        taxonomy: {
            automation: {
                weight: 6,
                skills: [
                    "plc",
                    "scada",
                    "industrial automation",
                    "control systems",
                ],
            },

            instrumentation: {
                weight: 6,
                skills: [
                    "sensors",
                    "transducers",
                    "control valves",
                    "process control",
                    "instrumentation",
                ],
            },

            tools: {
                weight: 5,
                skills: [
                    "arduino",
                    "labview",
                    "matlab",
                ],
            },
        },
    },
};

module.exports = domains;