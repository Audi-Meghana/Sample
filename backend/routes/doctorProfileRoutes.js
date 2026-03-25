const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const auth = require("../middleware/authMiddleware");
const DoctorProfile = require("../models/doctorProfileModel");

/* ── Multer config ── */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename:    (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

/* ═══════════════════════════════════════
   GET  /doctor-profile/:doctorId
   Returns full profile (all fields)
═══════════════════════════════════════ */
router.get("/profile", auth, async (req, res) => {
  try {
    const doctorId = req.user.id;
    if (!doctorId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const profile = await DoctorProfile
      .findOne({ doctorId })
      .populate("doctorId", "email");

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json(profile);
  } catch (err) {
    console.error("GET /doctor-profile/profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:doctorId", async (req, res) => {
  try {
    const profile = await DoctorProfile
      .findOne({ doctorId: req.params.doctorId })
      .populate("doctorId", "email");   // bring email from User model

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json(profile);
  } catch (err) {
    console.error("GET /doctor-profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ═══════════════════════════════════════
   PUT  /doctor-profile/:doctorId
   Updates ALL profile fields
═══════════════════════════════════════ */
router.put("/:doctorId", upload.single("profileImage"), async (req, res) => {
  try {
    const {
      fullName,
      specialty,
      phone,
      institution,
      qualification,
      experience,
      licenseNo,
      consultFee,
      languages,
      city,
      country,
      website,
      bio,
      availability,   // comes as JSON string from FormData
    } = req.body;

    /* ── Build update object — only include fields that were sent ── */
    const update = {};

    if (fullName      !== undefined) update.fullName      = fullName;
    if (specialty     !== undefined) update.specialty     = specialty;
    if (phone         !== undefined) update.phone         = phone;
    if (institution   !== undefined) update.institution   = institution;
    if (qualification !== undefined) update.qualification = qualification;
    if (experience    !== undefined) update.experience    = experience;
    if (licenseNo     !== undefined) update.licenseNo     = licenseNo;
    if (languages     !== undefined) update.languages     = languages;
    if (city          !== undefined) update.city          = city;
    if (country       !== undefined) update.country       = country;
    if (website       !== undefined) update.website       = website;
    if (bio           !== undefined) update.bio           = bio;

    /* consultFee: store as Number */
    if (consultFee !== undefined) {
      update.consultFee = consultFee === "" ? null : Number(consultFee);
    }

    /* availability: Frontend sends JSON.stringify(["Mon","Wed",...]) via FormData */
    if (availability !== undefined) {
      try {
        update.availability = JSON.parse(availability);
      } catch {
        update.availability = [];
      }
    }

    /* profileImage: only update if a new file was uploaded */
    if (req.file) {
      update.profileImage = req.file.filename;
    }

    const profile = await DoctorProfile.findOneAndUpdate(
      { doctorId: req.params.doctorId },
      { $set: update },
      {
        new:    true,       // return updated document
        upsert: true,       // create if doesn't exist yet
        runValidators: true
      }
    ).populate("doctorId", "email");

    res.json({ message: "Profile updated", profile });

  } catch (err) {
    console.error("PUT /doctor-profile error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* ═══════════════════════════════════════
   POST /doctor-profile/create
   Initial profile creation (first login)
═══════════════════════════════════════ */
router.post("/create", upload.single("profileImage"), async (req, res) => {
  try {
    const {
      doctorId, fullName, specialty, phone, institution,
      qualification, experience, licenseNo, consultFee,
      languages, city, country, website, bio, availability
    } = req.body;

    const existing = await DoctorProfile.findOne({ doctorId });
    if (existing) {
      return res.status(400).json({ message: "Profile already exists. Use PUT to update." });
    }

    const profileData = {
      doctorId,
      fullName,
      specialty,
      phone:         phone         || "",
      institution:   institution   || "",
      qualification: qualification || "",
      experience:    experience    || "",
      licenseNo:     licenseNo     || "",
      languages:     languages     || "",
      city:          city          || "",
      country:       country       || "",
      website:       website       || "",
      bio:           bio           || "",
      consultFee:    consultFee ? Number(consultFee) : null,
      availability:  availability  ? JSON.parse(availability) : [],
    };

    if (req.file) profileData.profileImage = req.file.filename;

    const profile = await DoctorProfile.create(profileData);
    res.status(201).json({ message: "Profile created", profile });

  } catch (err) {
    console.error("POST /doctor-profile/create error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;