const mongoose = require("mongoose");

const ScreeningSchema = new mongoose.Schema({
  answers: [{ type: String, required: true }],
  mode: { type: String, enum: ["voice", "text"], required: true },
  risk: { type: String, enum: ["low", "medium", "high"], required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Screening", ScreeningSchema);
