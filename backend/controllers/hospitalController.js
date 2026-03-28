const Hospital = require("../models/Hospital");

exports.getHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find();
    res.json(hospitals);
  } catch (error) {
    console.error("Error fetching hospitals", error);
    res.status(500).json({ message: "Error fetching hospitals", error: error.message });
  }
};
