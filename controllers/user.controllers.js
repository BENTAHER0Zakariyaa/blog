const connection = require("./../config/db.config");

function getProfile(req, res) {
  const { userId } = req.params;
  const selectUserInfoQuery = `SELECT id, username, email, createdAt FROM users WHERE id = ? AND deletedAt IS NULL`;
  const selectUserPostsQuery = `SELECT 
        posts.*,
        categories.name 
    FROM posts 
    INNER JOIN categories 
        ON posts.categoryId = categories.id
    WHERE 
        posts.userId = ? AND
        posts.deletedAt IS NULL`;

  connection.query(
    selectUserInfoQuery,
    [parseInt(userId)],
    function (selectUserInfoError, selectUserInfoResult) {
      if (selectUserInfoError) {
        console.log(selectUserInfoError);
        return res
          .json({
            error: true,
            message: "QUERY_ERROR",
          })
          .status(500);
      }
      if (selectUserInfoResult.length == 0) {
        return res
          .json({
            error: true,
            message: "USER_NOT_FOUND",
          })
          .status(400);
      }
      const user = selectUserInfoResult[0];
      connection.query(
        selectUserPostsQuery,
        [parseInt(userId)],
        function (selectUserPostsError, selectUserPostsResult) {
          if (selectUserPostsError) {
            console.log(selectUserPostsError);
            return res
              .json({
                error: true,
                message: "QUERY_ERROR",
              })
              .status(500);
          }
          const posts = selectUserPostsResult;
          return res
            .json({
              error: false,
              message: "USER_PROFILE_SELECTED",
              user,
              posts,
            })
            .status(200);
        }
      );
    }
  );
}

module.exports = { getProfile };
