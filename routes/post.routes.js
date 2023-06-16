const express = require("express");
const Router = express();

const tokenMiddleware = require("./../middlewares/token.middleware");
const postControllers = require("./../controllers/post.controllers");
const commentControllers = require("./../controllers/comment.controllers");
const connection = require("../config/db.config");

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

Router.post(
  "/posts/:postId/comment",
  tokenMiddleware.verifyToken,
  function (req, res) {
    const { user } = res.locals;
    const { postId } = req.params;
    const { body } = req.body;

    if (!body.trim()) {
      return res
        .json({
          error: true,
          message: "BODY_REQUIRED",
        })
        .status(400);
    }

    const addCommentQuery =
      "INSERT INTO comments (userId, postId, body) VALUES (?, ?, ?)";

    connection.query(
      addCommentQuery,
      [user.id, postId, body],
      function (addCommentError, addCommentResult) {
        if (addCommentError) {
          console.log(addCommentError);
          return res
            .json({
              error: true,
              message: "QUERY_ERROR",
            })
            .status(500);
        }
        if (addCommentResult.affectedRows == 0) {
          return res
            .json({
              error: true,
              message: "CAN_NOT_CREATE_COMMENT",
            })
            .status(500);
        }
        return res
          .json({
            error: false,
            message: "COMMENT_ADDED",
          })
          .status(200);
      }
    );
  }
);

module.exports = Router;
