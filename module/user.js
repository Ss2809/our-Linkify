const mongoose = require("mongoose");

const userschema = new mongoose.Schema({
  username: {
    type: String,
    trim: true,
    required : true,
    minlength: 3,
    maxlength: 20,
  },
  email: {
    type: String,
    uniqe: true,
    trim: true,
    required : true,
    lowercase: true,
    required: true,
  },
  password: { type: String, required: true, minlength: 5 },
  profilename: { type: String },
  bio: { type: String, maxlength: 150 },
  accountStatus: {
    type: String,
    enum: ["Active", "Deactivet", "banned"],
    default: "Active",
  },
  isVerifyed: { type: Boolean, default: "false" },
  isPrivate: { type: Boolean, default: "false" },
  gender: { type: String, enum: ["Male", "Female", "other"] },
  phonenumber: { type: Number, trim: true },
});

const User = mongoose.model("User", userschema);
module.exports = User;
