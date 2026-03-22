const DoctorProfile = require("../models/doctorProfileModel");

exports.createProfile = async (req, res) => {
  try {
    const profileData = { ...req.body };

    if (req.file) profileData.profileImage = req.file.filename;

    
    if (typeof profileData.availability === "string") {
      try { profileData.availability = JSON.parse(profileData.availability); }
      catch { profileData.availability = []; }
    }

    if (profileData.consultFee !== undefined && profileData.consultFee !== "") {
      profileData.consultFee = Number(profileData.consultFee);
    }

    const profile = await DoctorProfile.create(profileData);
    res.status(201).json(profile);
  } catch (error) {
    console.error("CREATE PROFILE ERROR:", error);
    res.status(400).json({ message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const profile = await DoctorProfile
      .findOne({ doctorId: req.params.doctorId })
      .populate("doctorId", "name email role");

    if (!profile) {
      return res.status(200).json({
        fullName:      "",
        specialty:     "",
        phone:         "",
        institution:   "",
        qualification: "",
        experience:    "",
        licenseNo:     "",
        consultFee:    "",
        languages:     "",
        city:          "",
        country:       "",
        website:       "",
        bio:           "",
        availability:  [],
        profileImage:  null,
        doctorId:      { email: "" }
      });
    }

    res.json(profile);
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    console.log("REQ BODY:", req.body);   
    console.log("REQ FILE:", req.file);   

    const updateData = {};

    
    const textFields = [
      "fullName", "specialty", "phone", "institution",
      "qualification", "experience", "licenseNo",
      "languages", "city", "country", "website", "bio"
    ];

    textFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

   
    if (req.body.consultFee !== undefined) {
      updateData.consultFee = req.body.consultFee === "" ? null : Number(req.body.consultFee);
    }

    
    if (req.body.availability !== undefined) {
      try {
        const parsed = JSON.parse(req.body.availability);
        updateData.availability = Array.isArray(parsed) ? parsed : [];
      } catch {
        updateData.availability = [];
      }
    }

    
    if (req.file) {
      updateData.profileImage = req.file.filename;
    }

    console.log("SAVING TO DB:", updateData); 

    const updatedProfile = await DoctorProfile.findOneAndUpdate(
      { doctorId: req.params.doctorId },
      { $set: updateData },
      { new: true, upsert: true, runValidators: false } 
    ).populate("doctorId", "name email role");

    console.log("SAVED PROFILE:", updatedProfile); 

    res.json(updatedProfile); 
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);
    res.status(400).json({ message: error.message });
  }
};