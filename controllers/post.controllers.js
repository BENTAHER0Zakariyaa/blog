const connection = require("./../config/db.config");

function getPosts(req, res) {
  const { filter, orderBy, orderWay } = req.query;

  let where = "";

  if (filter) {
    where = `   AND  posts.categoryId  = ${filter} `;
  }

  const options = {
    0: "id",
    1: "createdAt",
    2: "categoryName",
  };

  let order = "";

  if (orderBy && orderWay && options[orderBy]) {
    order += ` ORDER BY  ${options[orderBy]} ${
      orderWay == 0 ? "ASC" : "DESC"
    } `;
  }

  const selectPostsQuery = `SELECT 
      posts.*, 
      users.username, 
      categories.name as 'categoryName' 
    FROM 
    posts 
    INNER JOIN users ON 
      users.id = posts.userId 
    INNER JOIN categories ON 
      categories.id = posts.categoryId 
    WHERE posts.deletedAt IS NULL AND
     users.deletedAt IS NULL ${where} ${order} `;

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

function getPostsWithPagination(req, res) {
  const { currentPage, limit } = req.params;
  const { filter } = req.query; // => category id  : number

  let where = "";

  if (filter) {
    where += ` AND  posts.categoryId = ${filter} `;
  }

  if (currentPage < 0) {
    return res.json({
      error: true,
      message: "CURRENT_PAGE_CAN_NOT_BE_0",
    });
  }
  const getPostsCountQuery = `select count(*) as "count" from posts WHERE 1 ${where}`;
  console.log(getPostsCountQuery);
  connection.query(
    getPostsCountQuery,
    function (getPostsCountError, getPostsCountResult) {
      if (getPostsCountError) {
        console.log(getPostsCountError);
        return res.json({
          error: true,
          message: "QUERY_ERROR",
        });
      }
      const count = getPostsCountResult[0].count;
      const pages = Math.ceil(count / limit);
      if (pages < currentPage) {
        return res.json({ error: true, message: "PAGE_NOT_FOUND" });
      }
      const startPosition = (currentPage - 1) * limit;
      const selectPostsQuery = `select * from posts WHERE 1 ${where} LIMIT ?, ?`;

      connection.query(
        selectPostsQuery,
        [startPosition, parseInt(limit)],
        function (selectPostsError, selectPostsResult) {
          if (selectPostsError) {
            console.log(selectPostsError);
            return res.json({
              error: true,
              message: "QUERY_ERROR",
            });
          }
          return res.json({
            count,
            numberOfPages: pages,
            currentPage,
            limit,
            posts: selectPostsResult,
          });
        }
      );
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

function updatePost(req, res) {
  const { user } = res.locals;
  const { postId } = req.params;
  const { categoryId, body } = req.body;

  if (!categoryId) {
    return res
      .json({
        error: true,
        message: "CATEGORY_ID_REQUIRED",
      })
      .status(400);
  }

  if (!body?.trim()) {
    return res
      .json({
        error: true,
        message: "BODY_REQUIRED",
      })
      .status(400);
  }

  const updatePostQuery = `UPDATE 
  posts SET 
    posts.updatedAt = CURRENT_TIMESTAMP,
    posts.body = ? ,
    posts.categoryId = ?
  WHERE 
    posts.id = ? AND 
    posts.userId = ? AND 
    posts.deletedAt IS NULL`;

  connection.query(
    updatePostQuery,
    [body, categoryId, postId, user.id],
    function (updatePostError, updatePostResult) {
      if (updatePostError) {
        console.log(updatePostError);
        return res
          .json({
            error: true,
            message: "QUERY_ERROR",
          })
          .status(500);
      }

      if (updatePostResult.affectedRows == 0) {
        return res
          .json({
            error: true,
            message: "CAN_NOT_UPDATE_POST",
          })
          .status(500);
      }
      return res
        .json({
          error: false,
          message: "POST_UPDATED",
        })
        .status(200);
    }
  );
}

module.exports = {
  getPosts,
  getPost,
  createPost,
  deletePost,
  updatePost,
  getPostsWithPagination,
};
