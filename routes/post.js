const express = require("express");
const authmiddleware = require("../middleware/auth");
const upload = require("../config/multer-setup");
const router = express.Router();
const Post = require("../module/post");
const User = require("../module/user");

router.get("/followingpost", authmiddleware, async (req, res) => {
  let { page = 1, limit = 2 } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);
  const {cursor } = req.query;
  const user = await User.findById(req.user._id).select("following");

  if (!user || !user.following || user.following.length === 0) {
    return res.json({ post: [] });
  }
  if(cursor ){
    query.createdAt = {$lt : new Date.now()}
  }
   
  const posts = await Post.find({ user: { $in: user.following } })
    .sort({ createdAt: -1 })
    .lean()
    .skip((page - 1) * limit)
    .limit(limit);
  const nextcursor = posts.length > 0 ? posts[posts.length-1].createdAt : null
  //console.log({posts})
  
  res.json({ post: posts , page, limit, nextcursor});
});
router.post(
  "/",
  authmiddleware,
  upload.array("media", 10),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res
          .status(400)
          .json({ message: "At least one image or video required!" });
      }

      const { caption, tags, location } = req.body;

      const mediaFiles = req.files.map((file) => ({
        name: file.filename,
        mediaType: file.mimetype.includes("video") ? "video" : "image",
      }));

      const newpost = new Post({
        user: req.user._id,
        caption,
        tags,
        location,
        media: mediaFiles,
      });

      await newpost.save();

      res
        .status(201)
        .json({ message: "Post uploaded successfully!", post: newpost });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  }
);

router.get("/myposts", authmiddleware, async (req, res) => {
  let { page = 1, limit = 5 } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);

  const post = await Post.find({ user: req.user._id })
    .lean()
    .skip((page - 1) * limit)
    .limit(limit);
  const nextpage = post.length === limit ? true : false;
  res.json({ post, page, limit, nextpage });
});

module.exports = router;
