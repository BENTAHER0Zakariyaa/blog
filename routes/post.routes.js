const express = require("express");
const Router = express();
const jwt = require("jsonwebtoken");
const connection = require("./../config/db.config");

Router.get("/posts", function (req, res) {});
Router.get("/posts/:idPost", function (req, res) {});

Router.post("/post", function (req, res) {
  const token = req.headers["x-auth-token"];
  if (!token) {
    return res
      .json({
        error: true,
        message: "INVALID_ACCESS_TOKEN",
      })
      .status(400);
  }

  jwt.verify(token, process.env.JWT_PRIVATE_KEY, function (error, payload) {
    if (error) {
      return res
        .json({
          error: true,
          message: "INVALID_TOKEN",
        })
        .status(400);
    }
    const { id } = payload;
    const { body, categoryId } = req.body;

    if (!body?.trim()) {
      return res
        .json({
          error: true,
          message: "BODY_REQUIRED",
        })
        .status(400);
    }

    if (!categoryId) {
      return res
        .json({
          error: true,
          message: "CATEGORY_REQUIRED",
        })
        .status(400);
    }

    const createNewPostQuery = `INSERT INTO posts (userId, body, categoryId) VALUES (${id}, '${body}', ${categoryId})`;

    connection.query(
      createNewPostQuery,
      function (createNewPostError, createNewPostResult) {
        if (createNewPostError) {
          console.log(createNewPostError);
          return res.json({
            error: true,
            message: "QUERY_ERROR",
          });
        }
        return res.json({
          error: false,
          message: "POST_CREATED",
        });
      }
    );
  });
});

Router.delete("/posts/:idPost", function (req, res) {});
Router.put("/posts/:idPost", function (req, res) {});


module.exports = Router;
