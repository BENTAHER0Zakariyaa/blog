const express = require("express");
const Router = express();

const tokenMiddleware = require("./../middlewares/token.middleware");
const postControllers = require("./../controllers/post.controllers");
const commentControllers = require("./../controllers/comment.controllers");
const connection = require("../config/db.config");

Router.get("/posts", tokenMiddleware.verifyToken, postControllers.getPosts);

Router.get(
  "/posts/pages/:currentPage/limit/:limit",
  tokenMiddleware.verifyToken,
  function (req, res) {
    const { currentPage, limit } = req.params;
    // test : currentPage > 0
    const getPostsCountQuery = `select count(*) as "count" from posts`;
    connection.query(
      getPostsCountQuery,
      function (getPostsCountError, getPostsCountResult) {
        console.log(getPostsCountError);
        // error test
        const count = getPostsCountResult[0].count;
        const pages = Math.ceil(count / limit); //<---- count dyal pages
        if (pages < currentPage) return res.json({ error: true });
        const startPosition = (currentPage - 1) * limit; //<---- mnin gha ybda y selecti
        const endPosition = currentPage * limit;
        const selectPostsQuery = `select * from posts LIMIT ?, ?`;
        connection.query(
          selectPostsQuery,
          [startPosition, parseInt(limit)],
          function (selectPostsError, selectPostsResult) {
            console.log(selectPostsError);
            // test : query error

            return res.json({
              count,
              pages,
              startPosition,
              endPosition,
              results: selectPostsResult,
            });
          }
        );
      }
    );
  }
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
