const express = require("express");
const router = express.Router();
const { getHospitals } = require("../controllers/hospitalController");

// GET /hospitals
router.get("/", getHospitals);

module.exports = router;
