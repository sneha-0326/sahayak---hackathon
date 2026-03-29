const Patient = require('../models/Patient');

// Save or update patient details
exports.savePatient = async (req, res) => {
  try {
    const { userId, ashaId, name, age, phone, state, district, city } = req.body;
    if (!name || !age || !phone || !state || !district || !city) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const query = userId ? { userId } : { _id: req.body._id };
    const patient = await Patient.findOneAndUpdate(
      query,
      { userId, ashaId, name, age, phone, state, district, city },
      { upsert: true, new: true }
    );

    res.status(201).json({ message: 'Patient saved', patient });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get patients registered by a specific ASHA
exports.getAllPatients = async (req, res) => {
  try {
    const { ashaId } = req.query;
    const filter = ashaId ? { ashaId } : {};
    const patients = await Patient.find(filter).sort({ createdAt: -1 });
    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get a single patient by userId
exports.getPatientByUser = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.params.userId });
    if (!patient) return res.status(404).json({ message: 'Not found' });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
