const connection = require("./../config/db.config");

function getCategories(req, res) {
  selectCategoriesQuery = "SELECT id, name FROM categories order by id";
  
  connection.query(
    selectCategoriesQuery,
    function (selectCategoriesError, selectCategoriesResult) {
      if (selectCategoriesError) {
        return res.json({
          error: true,
          message: "QUERY_ERROR",
        });
      }

      return res.json({
        error: false,
        message: "CATEGORIES_SELECTED",
        categories: selectCategoriesResult,
      });
    }
  );
}

module.exports = {
  getCategories,
};
