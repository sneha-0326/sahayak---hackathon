const express = require("express");
const router = express.Router();
const { syncScreening, calculateRisk } = require("../controllers/screeningController");

// POST /sync  -> store screening results
router.post("/sync", syncScreening);

// POST /calculate-risk -> compute score & risk
router.post("/calculate-risk", calculateRisk);

module.exports = router;
