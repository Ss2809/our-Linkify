const express = require("express");
const User = require("../module/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const router = express.Router();

router.post("/Signup", async (req, res) => {
  const { username, email, password, profilename, bio, gender, phonenumber } =
    req.body;
  if (!email || !password || !username) {
    return res.json({ message: "Required filled all" });
  }
  const user = await User.findOne({
    $or: [{ email: email }, { username: username }],
  });
  if (user) {
    return res.json({
      message:
        user.username === username
          ? "Username all ready taken"
          : "Email all ready taken",
    });
  }
  const hashpassword = await bcrypt.hash(password, 10);
  const newuser = new User({
    username,
    email,
    password: hashpassword,
    profilename,
    bio,
    gender,
    phonenumber,
  });
  await newuser.save();
  const createtokenAcces = jwt.sign(
    { _id: newuser._id, username: username },
    process.env.Access_key,
    {
      expiresIn: "1d",
    }
  );

  const createtokenrefresh = jwt.sign(
    { _id: newuser._id },
    process.env.Refresh_key,
    {
      expiresIn: "7d",
    }
  );

  res.cookie("refreshtoken", createtokenrefresh, {
    httpOnly: true,
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(201).json({
    message: "Signup successful",
    createtokenAcces,
    newuser
  });
});

module.exports = router;
