const express = require("express");
const router = express.Router();
const upload = require("../utils/upload");
const { analyzeResume } = require("../controllers/resumeController");

router.post("/upload", upload.single("resume"), analyzeResume);

module.exports = router;
