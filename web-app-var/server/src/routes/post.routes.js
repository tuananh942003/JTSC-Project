import express from 'express';
import { createPost, getAllPosts, getPostById, updatePostById, deletePostById } from '../controller/post.controller.js';
const postRouter = express.Router();
postRouter.route('/').post(createPost).get(getAllPosts);
postRouter.route('/:id').get(getPostById).put(updatePostById).delete(deletePostById);
export default postRouter;