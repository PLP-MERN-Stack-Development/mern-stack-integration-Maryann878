const Post = require('../models/post');
const { validationResult } = require('express-validator');

// Get all posts
exports.getPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;
    const query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.title = { $regex: search, $options: 'i' }; // Case-insensitive search by title
    }

    const skip = (page - 1) * limit;
    const posts = await Post.find(query)
      .populate('category author')
      .limit(Number(limit))
      .skip(skip);

    const totalPosts = await Post.countDocuments(query);
    const totalPages = Math.ceil(totalPosts / limit);

    res.json({ posts, totalPages, currentPage: Number(page) });
  } catch (err) {
    next(err);
  }
};

// Get single post
exports.getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate('category author comments.user');
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) {
    next(err);
  }
};

// Create post
exports.createPost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { title, content, category } = req.body;
    const featuredImage = req.file ? req.file.filename : 'default-post.jpg';
    const post = new Post({ title, content, category, featuredImage, author: req.user.id });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    next(err);
  }
};

// Update post
exports.updatePost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { title, content, category } = req.body;
    let featuredImage = req.body.featuredImage;

    if (req.file) {
      featuredImage = req.file.filename;
    }

    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { title, content, category, featuredImage, author: req.user.id },
      { new: true }
    );
    res.json(post);
  } catch (err) {
    next(err);
  }
};

// Delete post
exports.deletePost = async (req, res, next) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted' });
  } catch (err) {
    next(err);
  }
};

// Add comment
exports.addComment = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    post.comments.push({ user: req.body.user, content: req.body.content });
    await post.save();
    res.json(post);
  } catch (err) {
    next(err);
  }
};
