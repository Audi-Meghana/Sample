const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const geneRoutes = require("./routes/geneRoutes");

dotenv.config();
connectDB();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/doctor-profile", require("./routes/doctorProfileRoutes"));
app.use("/api/cases", require("./routes/caseRoutes"));

// app.use("/api/analysis", require("./routes/caseAnalysisRoutes"));
app.use("/api/gene", geneRoutes);
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static("uploads"));
app.use("/api/history", require("./routes/historyRoutes"));
app.use("/api", require("./routes/chatroutes"));

// Health check endpoint for deployment platforms
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date() });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`✓ FastAPI URL: ${process.env.FASTAPI_URL || "http://127.0.0.1:8000"}`);
});
