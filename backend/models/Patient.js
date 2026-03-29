const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ashaId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name:     { type: String, required: true },
  age:      { type: String, required: true },
  phone:    { type: String, required: true },
  state:    { type: String, required: true },
  district: { type: String, required: true },
  city:     { type: String, required: true },
  createdAt:{ type: Date, default: Date.now }
});

module.exports = mongoose.model('Patient', PatientSchema);
