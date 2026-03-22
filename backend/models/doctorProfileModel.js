const mongoose = require("mongoose");

const doctorProfileSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    
    fullName: {
      type: String,
      required: true
    },
    specialty: {
      type: String,
      default: ""
    },
    profileImage: {
      type: String
    },

    phone: {
      type: String,
      trim: true,
      default: ""
    },
    website: {
      type: String,
      trim: true,
      default: ""
    },

    
    institution: {
      type: String,
      trim: true,
      default: ""
    },
    qualification: {
      type: String,
      trim: true,
      default: ""
    },
    experience: {
      type: String,
  
      default: ""
    },
    licenseNo: {
      type: String,
      trim: true,
      default: ""
    },
    consultFee: {
      type: Number,
      min: 0,
      default: null
    },
    languages: {
      type: String,
      trim: true,
      default: ""
    },

    
    city: {
      type: String,
      trim: true,
      default: ""
    },
    country: {
      type: String,
      trim: true,
      default: ""
    },

    
    availability: {
      type: [String],
      
      default: []
    },

    bio: {
      type: String,
      trim: true,
      default: "",
      maxlength: 1000
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("DoctorProfile", doctorProfileSchema);