const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const geneRoutes = require("./routes/geneRoutes");

dotenv.config();
connectDB();

const app = express();
app.use(express.urlencoded({ extended: true }));

// CORS configuration - Allow all origins for now to fix deployment issues
const corsOptions = {
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Access-Control-Allow-Origin']
};

app.use(cors(corsOptions));

app.use(express.json());

// Handle preflight requests if they still arrive
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

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
  res.status(200).json({
    status: "OK",
    timestamp: new Date(),
    environment: process.env.NODE_ENV || "undefined",
    port: process.env.PORT || "undefined",
    mongo_connected: true // We'll assume it's connected if server is running
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`✓ FastAPI URL: ${process.env.FASTAPI_URL || "http://127.0.0.1:8000"}`);
  console.log(`✓ CORS: Enabled for all origins`);
  console.log(`✓ Health check: http://localhost:${PORT}/health`);
});
