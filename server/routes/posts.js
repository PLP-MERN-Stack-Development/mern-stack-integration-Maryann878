const express = require('express');
const router = express.Router();
const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  addComment,
} = require('../controllers/postsController');
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getPosts);
router.get('/:id', getPost);
router.post(
  '/',
  [auth, upload.single('featuredImage'), [check('title', 'Title is required').not().isEmpty(), check('content', 'Content is required').not().isEmpty(), check('category', 'Category is required').not().isEmpty()]],
  createPost
);
router.put(
  '/:id',
  [auth, upload.single('featuredImage'), [check('title', 'Title is required').not().isEmpty(), check('content', 'Content is required').not().isEmpty(), check('category', 'Category is required').not().isEmpty()]],
  updatePost
);
router.delete('/:id', auth, deletePost);
router.post('/:id/comments', auth, addComment);

module.exports = router;
