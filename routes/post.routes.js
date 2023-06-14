const express = require("express");
const Router = express();

const tokenMiddleware = require("./../middlewares/token.middleware");
const postControllers = require("./../controllers/post.controllers");

Router.get("/posts", tokenMiddleware.verifyToken, postControllers.getPosts);

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

Router.put("/posts/:idPost", function (req, res) {});

module.exports = Router;
