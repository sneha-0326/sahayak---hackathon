const express = require("express");
const router = express.Router();
const { predictRisk } = require("../controllers/mlController");

// POST /predict-risk
router.post("/", predictRisk);

module.exports = router;
