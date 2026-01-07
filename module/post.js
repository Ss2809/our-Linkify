const mongoose = require("mongoose");
const commentSchma = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  text: { type: String, minlength: 1, required: true, trim : true},
  creatAt: { type: Date, default: Date.now },
  replies: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      text: { type: String, minlength: 1 },
      creatAt: { type: Date, default: Date.now },
    },
  ],
});
const postschema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    media: [
      {
        name: { type: String, required: true },
        mediaType: { type: String, enum: ["image", "video"], required: true },
      },
    ],
    caption: { type: String },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    tags: { type: String },
    location: { type: String },
    comment: [commentSchma],
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model("Post", postschema);
module.exports = Post;
