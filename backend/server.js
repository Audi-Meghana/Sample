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

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);
