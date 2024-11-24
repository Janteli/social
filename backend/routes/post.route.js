import express from 'express';
import isAuthenticated from '../middlewares/isAuthenticated.middleware.js';
import upload from '../middlewares/multer.js';
import { addComment, addNewPost, bookmarkPost, deletePost, disLikePost, getAllPost, getCommentsOfPost, getUserPost, likePost } from '../controllers/post.controller.js';

const router = express.Router();

router.route('/addpost').post(isAuthenticated, upload.single('image'), addNewPost);
router.route('/all').get( isAuthenticated, getAllPost);
router.route('/userpost/all').get(isAuthenticated,  getUserPost);
router.route('/:id/like').post(isAuthenticated,  likePost);
router.route('/:id/dislike').post(isAuthenticated,  disLikePost);
router.route('/:id/comment').post(isAuthenticated,  addComment);
router.route('/:id/comment/all').get(isAuthenticated,  getCommentsOfPost);
router.route('/delete-post/:id').delete(isAuthenticated,  deletePost);
router.route('/:id/bookmark').get(isAuthenticated,  bookmarkPost);

export default router;