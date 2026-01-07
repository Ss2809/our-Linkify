const express = require("express");
const authmiddleware = require("../middleware/auth");
const upload = require("../config/multer-setup");
const router = express.Router();
const Post = require("../module/post");
const User = require("../module/user");
const fs = require("fs");
const path = require("path");
const { console } = require("inspector");

router.get("/followingpost", authmiddleware, async (req, res) => {
  let { page = 1, limit = 2 } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);
  const { cursor } = req.query;
  const user = await User.findById(req.user._id).select("following");

  if (!user || !user.following || user.following.length === 0) {
    return res.json({ post: [] });
  }
  if (cursor) {
    query.createdAt = { $lt: new Date.now() };
  }

  const posts = await Post.find({ user: { $in: user.following } })
    .sort({ createdAt: -1 })
    .lean()
    .skip((page - 1) * limit)
    .limit(limit);
  const nextcursor =
    posts.length > 0 ? posts[posts.length - 1].createdAt : null;
  //console.log({posts})

  res.json({ post: posts, page, limit, nextcursor });
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

  const total = await Post.countDocuments({ user: req.user._id });
  const userId = req.user._id;
  console.log("USER ID:", userId);

  const post = await Post.find({ user: userId })
    .sort({ createdAt: -1 })
    .lean()
    .skip((page - 1) * limit)
    .limit(limit)
    .select("user media location");

  const hasNext = page * limit < total;

  res.json({ post, page, limit, hasNext, userId });
});

router.delete("/:postId/remove", authmiddleware, async (req, res) => {
  const postId = req.params.postId;
  const userId = req.user._id;
  if (!postId) {
    return res.json({ message: "postID not Provided!!" });
  }
  const user = await User.findById(userId);
  if (!user) {
    return res.json("User not found");
  }

  const post = await Post.findById(postId);
  if (!post) {
    return res.json({ message: "post not found!!" });
  }
  if (post.user.toString() !== userId.toString()) {
    return res
      .status(403)
      .json({ message: "You are not allowed to delete this post!" });
  }
  //IMP remove imges form server is imp fu*k you
  const totalpath = path.join(__dirname, "../upload/post");

  post.media.forEach((file) => {
    const filePath = path.join(totalpath, file.name);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });

  await Post.findByIdAndDelete(postId);
  res.json({ message: "post delete", success: true });
});

router.post("/like/:postId", authmiddleware, async (req, res) => {
  const postId = req.params.postId;
  const userId = req.user._id;
  if (!postId) {
    return res.json({ message: "postId not found!" });
  }
  const post = await Post.findById(postId);
  if (!post) {
    return res.json({ message: "post not found!" });
  }
  if (post.likes.includes(userId)) {
    post.likes.pull(userId);
    await post.save();
    return res.json({ liked: false });
  }
  post.likes.push(userId);
  await post.save();
  totallikes = post.likes.length;
  res.json({ message: "Likes", liked: true, totallikes });
});

router.post("/comment/:postId", authmiddleware, async (req, res) => {
  const postId = req.params.postId;
  const userId = req.user._id;
  const { commentmessage } = req.body;
  if (!commentmessage) {
    return res.json({ message: "commentmessage not provided" });
  }
  const post = await Post.findById(postId);
  if (!post) {
    return res.json({ message: "post not found!!" });
  }
  const newcomment = post.comment.push({
    user: userId,
    text: commentmessage,
  });
  await post.save();
  const totalcommet = post.comment;
  res.json({ message: "Commet added", totalcommet });
});

router.post(
  "/replies/comment/:postId/:commentId",
  authmiddleware,
  async (req, res) => {
    const postId = req.params.postId;
    const commentId = req.params.commentId;
    const { text } = req.body;
    if (!text || text.length > 1 || text === " ") return res.json({ message: "Reply required" });
    if (!postId || !commentId) {
      return res.json({ message: "postId and commentId not Provided!" });
    }
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(400).json({ message: "post is not found" });
    }
    const comment = post.comment.id(commentId);
    if (!comment) {
      return res.status(400).json({ message: "comment is not found" });
    }
    comment.replies.push({
      user: req.user._id,
      text: text,
    });
    await post.save();
    const totalcommet = post.comment;
    res.json({ message: "replies done!", totalcommet });
  }
);

router.delete("/:postId/commentdelet/:commentId", authmiddleware, async(req,res)=>{
  const {postId,commentId} = req.params
  if(!postId || !commentId){
    return res.json({message:"postId and CommentId not provided!"})
  }
  const post = await Post.findById(postId)
  if(!post){
    return res.status(400).json({message:"post not found!!"})
  }
  const comment =  post.comment.id(commentId) // id is mongoose concepts
  if(!comment){
    return res.status(400).json({message:"comment not found!!"})
  }
   if(
    post.user.toString() === req.user._id.toString() ||
    comment.user.toString() === req.user._id.toString()
  ){
    post.comment.pull(commentId);

    await post.save();
    return res.json({success:true, message:"Comment deleted"});
  }
    res.status(403).json({message:"Not allowed"});
})

module.exports = router;
