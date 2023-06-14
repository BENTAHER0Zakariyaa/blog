const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
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
    res.locals.user = payload;
    next();
  });
}

module.exports = { verifyToken };
