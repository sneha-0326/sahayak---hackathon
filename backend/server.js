require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const hospitalRoutes = require("./routes/hospitalRoutes");
const screeningRoutes = require("./routes/screeningRoutes");
const mlRoutes = require("./routes/mlRoutes");
const authRoutes = require("./routes/authRoutes");
const patientRoutes = require("./routes/patientRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/sahayak";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => { console.error("MongoDB connection error", err); process.exit(1); });

app.get("/", (req, res) => res.send("SAHAYAK backend is running 🚀"));

app.use("/hospitals", hospitalRoutes);
app.use("/sync", screeningRoutes);
app.use("/predict-risk", mlRoutes);
app.use("/auth", authRoutes);
app.use("/patients", patientRoutes);

app.use((req, res) => res.status(404).json({ message: "Route not found" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
