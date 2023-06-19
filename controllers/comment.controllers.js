const connection = require("../config/db.config");

function getComments(req, res) {
  const { postId } = req.params;

  const selectCommentsQuery = `SELECT 
      comments.*,
      users.username 
    FROM 
      comments INNER JOIN users ON
      comments.userId = users.id 
    WHERE 
    comments.postId = ? AND 
    comments.deletedAt IS NULL 
    `;
  connection.query(
    selectCommentsQuery,
    [postId],
    function (selectCommentsError, selectCommentsResult) {
      if (selectCommentsError) {
        console.log(selectCommentsError);
        return res
          .json({
            error: true,
            message: "QUERY_ERROR",
          })
          .status(500);
      }
      if (selectCommentsResult.length == 0) {
        return res
          .json({
            error: true,
            message: "NOT_FOUND",
          })
          .status(400);
      }
      return res
        .json({
          error: false,
          message: "COMMENTS_SELECTED",
          comments: selectCommentsResult,
        })
        .status(200);
    }
  );
}

function getComment(req, res) {
  const { postId, commentId } = req.params;

  const selectCommentsQuery = `SELECT 
    comments.*,
    users.username 
  FROM 
    comments INNER JOIN users ON
    comments.userId = users.id 
  WHERE 
  comments.postId = ? AND 
  comments.id = ? AND 
  comments.deletedAt IS NULL 
  `;
  connection.query(
    selectCommentsQuery,
    [postId, commentId],
    function (selectCommentsError, selectCommentsResult) {
      if (selectCommentsError) {
        console.log(selectCommentsError);
        return res
          .json({
            error: true,
            message: "QUERY_ERROR",
          })
          .status(500);
      }
      if (selectCommentsResult.length == 0) {
        return res
          .json({
            error: true,
            message: "NOT_FOUND",
          })
          .status(400);
      }
      return res
        .json({
          error: false,
          message: "COMMENT_SELECTED",
          comment: selectCommentsResult[0],
        })
        .status(200);
    }
  );
}

function addComment(req, res) {
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

function removeComment(req, res) {
  const { user } = res.locals;
  const { postId, commentId } = req.params;

  const deleteCommentQuery = `UPDATE 
  comments 
    SET comments.deletedAt = CURRENT_TIMESTAMP
  WHERE 
    comments.userId = ? AND 
    comments.postId = ? AND 
    comments.id = ? AND 
    comments.deletedAt IS NULL`;

  connection.query(
    deleteCommentQuery,
    [user.id, postId, commentId],
    function (deleteCommentError, deleteCommentResult) {
      if (deleteCommentError) {
        console.log(deleteCommentError);
        return res
          .json({
            error: true,
            message: "QUERY_ERROR",
          })
          .status(500);
      }

      if (deleteCommentResult.affectedRows == 0) {
        return res
          .json({
            error: true,
            message: "CAN_NOT_DELETE_COMMENT",
          })
          .status(400);
      }
      return res
        .json({
          error: false,
          message: "COMMENT_DELETED",
        })
        .status(200);
    }
  );
}

function editComment(req, res) {
  const { user } = res.locals;
  const { postId, commentId } = req.params;
  const { body } = req.body;

  if (!body?.trim()) {
    return res.json({
      error: true,
      message: "BODY_REQUIRED",
    });
  }

  const editCommentQuery = `UPDATE 
  comments 
    SET comments.body = ?,
    comments.updatedAt = CURRENT_TIMESTAMP
  WHERE 
    comments.userId = ? AND 
    comments.postId = ? AND 
    comments.id = ? AND 
    comments.deletedAt IS NULL`;

  connection.query(
    editCommentQuery,
    [body, user.id, postId, commentId],
    function (editCommentError, editCommentResult) {
      if (editCommentError) {
        console.log(editCommentError);
        return res
          .json({
            error: true,
            message: "QUERY_ERROR",
          })
          .status(500);
      }

      if (editCommentResult.affectedRows == 0) {
        return res
          .json({
            error: true,
            message: "CAN_NOT_EDIT_COMMENT",
          })
          .status(400);
      }
      return res
        .json({
          error: false,
          message: "COMMENT_UPDATED",
        })
        .status(200);
    }
  );
}

module.exports = {
  getComments,
  addComment,
  getComment,
  removeComment,
  editComment,
};
