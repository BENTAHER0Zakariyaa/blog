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

module.exports = { getComments };
