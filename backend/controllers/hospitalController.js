const Hospital = require("../models/Hospital");

// Dummy hospital data to ship with the app (NHM-like empaneled sites)
const DUMMY_HOSPITALS = [
  {
    name: "District Women & Child Hospital",
    location: "Sundarpur Block, Bihar",
    latitude: 25.5941,
    longitude: 85.1376,
  },
  {
    name: "Primary Health Centre (PHC) Chhatarpur",
    location: "Chhatarpur Village, Uttar Pradesh",
    latitude: 24.8530,
    longitude: 79.9160,
  },
  {
    name: "Community Health Centre (CHC) Nilokheri",
    location: "Nilokheri, Haryana",
    latitude: 29.6625,
    longitude: 76.9300,
  },
];

exports.getHospitals = async (req, res) => {
  try {
    let hospitals = await Hospital.find();

    // If DB is empty, seed with dummy hospital list and return
    if (!hospitals || hospitals.length === 0) {
      hospitals = await Hospital.insertMany(DUMMY_HOSPITALS);
    }

    res.json(hospitals);
  } catch (error) {
    console.error("Error fetching hospitals", error);
    res.status(500).json({ message: "Error fetching hospitals", error: error.message });
  }
};
