require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();


app.use(cors());
app.use(express.json());

// Routes
const resumeRoutes = require("./routes/resumeRoutes");
app.use("/api/resume", resumeRoutes);

// Root test route
app.get("/", (req, res) => {
    console.log("Root route accessed");
    res.send("Resume Analyst API Running");
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
