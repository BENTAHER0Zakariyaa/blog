const express = require("express");
const Router = express();

const tokenMiddleware = require("./../middlewares/token.middleware");
const postControllers = require("./../controllers/post.controllers");
const commentControllers = require("./../controllers/comment.controllers");

Router.get("/posts", tokenMiddleware.verifyToken, postControllers.getPosts);

Router.get(
  "/posts/pages/:currentPage/limit/:limit",
  tokenMiddleware.verifyToken,
  postControllers.getPostsWithPagination
);

Router.get(
  "/posts/:postId",
  tokenMiddleware.verifyToken,
  postControllers.getPost
);

Router.post("/post", tokenMiddleware.verifyToken, postControllers.createPost);

Router.delete(
  "/posts/:postId",
  tokenMiddleware.verifyToken,
  postControllers.deletePost
);

Router.put(
  "/posts/:postId",
  tokenMiddleware.verifyToken,
  postControllers.updatePost
);

// comments section
Router.get(
  "/posts/:postId/comments",
  tokenMiddleware.verifyToken,
  commentControllers.getComments
);

Router.get(
  "/posts/:postId/comments/:commentId",
  tokenMiddleware.verifyToken,
  commentControllers.getComment
);

Router.post(
  "/posts/:postId/comment",
  tokenMiddleware.verifyToken,
  commentControllers.addComment
);

Router.delete(
  "/posts/:postId/comments/:commentId",
  tokenMiddleware.verifyToken,
  commentControllers.removeComment
);

Router.put(
  "/posts/:postId/comments/:commentId",
  tokenMiddleware.verifyToken,
  commentControllers.editComment
);

module.exports = Router;
