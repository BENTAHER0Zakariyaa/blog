const connection = require("./../config/db.config");

function getPosts(req, res) {
  const selectPostsQuery =
    "SELECT posts.*, users.username, categories.name as 'categoryName' FROM posts INNER JOIN users ON users.id = posts.userId INNER JOIN categories ON categories.id = posts.categoryId WHERE posts.deletedAt IS NULL AND users.deletedAt IS NULL";

  connection.query(
    selectPostsQuery,
    function (selectPostsError, selectPostsResult) {
      if (selectPostsError) {
        console.log(selectPostsError);
        return res
          .json({
            error: true,
            message: "QUERY_ERROR",
          })
          .status(500);
      }
      return res
        .json({
          error: false,
          message: "POSTS_SELECTED",
          posts: selectPostsResult,
        })
        .status(200);
    }
  );
}
function getPost(req, res) {
  const { postId } = req.params;

  const selectPostQuery = `SELECT 
      posts.*, 
      users.username, 
      categories.name as 'categoryName' 
      FROM posts 
      INNER JOIN users 
      ON users.id = posts.userId 
      INNER JOIN categories
      ON categories.id = posts.categoryId 
      WHERE posts.deletedAt IS NULL AND users.deletedAt IS NULL AND posts.id = ?`;

  connection.query(
    selectPostQuery,
    [postId],
    function (selectPostError, selectPostResult) {
      if (selectPostError) {
        console.log(selectPostError);
        return res
          .json({
            error: true,
            message: "QUERY_ERROR",
          })
          .status(500);
      }
      if (selectPostResult.length == 0) {
        return res
          .json({
            error: true,
            message: "POST_NOT_FOUND",
          })
          .status(404);
      }
      return res
        .json({
          error: false,
          message: "POST_SELECTED",
          post: selectPostResult[0],
        })
        .status(200);
    }
  );
}

function createPost(req, res) {
  const { user } = res.locals;
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

  const createNewPostQuery = `INSERT INTO posts (userId, body, categoryId) VALUES (?, ?, ?)`;

  connection.query(
    createNewPostQuery,
    [user.id, body, categoryId],
    function (createNewPostError, createNewPostResult) {
      if (createNewPostError) {
        console.log(createNewPostError);
        return res.json({
          error: true,
          message: "QUERY_ERROR",
        });
      }
      return res
        .json({
          error: false,
          message: "POST_CREATED",
        })
        .status(200);
    }
  );
}

function deletePost(req, res) {
  const { user } = res.locals;
  const { postId } = req.params;

  const deletePostQuery = `UPDATE posts SET deletedAt = CURRENT_TIMESTAMP WHERE posts.id = ? AND posts.userId = ? AND posts.deletedAt IS NULL`;

  connection.query(
    deletePostQuery,
    [postId, user.id],
    function (deletePostError, deletePostResult) {
      if (deletePostError) {
        console.log(deletePostError);
        return res
          .json({
            error: true,
            message: "QUERY_ERROR",
          })
          .status(500);
      }
      if (deletePostResult.affectedRows != 1) {
        return res
          .json({
            error: true,
            message: "CAN_NOT_DELETE_THIS_POST",
          })
          .status(400);
      }
      return res
        .json({
          error: false,
          message: "POST_DELETED",
        })
        .status(200);
    }
  );
}

module.exports = { getPosts, getPost, createPost, deletePost };
