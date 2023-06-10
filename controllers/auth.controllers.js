const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const connection = require("./../config/db.config");

require("dotenv").config();

function login(req, res) {
  const { email, password } = req.body;

  if (!email?.trim() || !password?.trim()) {
    return res
      .json({
        error: true,
        message: "FIELDS_ARE_REQUIRED",
      })
      .status(400);
  }

  const getUserQuery = `SELECT * FROM users WHERE email = '${email}'`;

  connection.query(getUserQuery, function (userQueryError, userQueryResult) {
    if (userQueryError) {
      console.log(userQueryError);
      return res
        .json({
          error: true,
          message: "QUERY_ERROR",
        })
        .status(500);
    }
    if (userQueryResult.length == 0) {
      return res
        .json({
          error: true,
          message: "USER_NOT_EXIST",
        })
        .status(400);
    }
    const { hashPassword, ...others } = userQueryResult[0];

    bcrypt.compare(password, hashPassword, (err, isCorrect) => {
      if (err) {
        return res
          .json({
            error: true,
            message: "SOMETHING_WONT_WRONG",
          })
          .status(500);
      }

      if (!isCorrect) {
        return res
          .json({
            error: true,
            message: "USER_NOT_EXIST",
          })
          .status(400);
      }

      const key = process.env.JWT_PRIVATE_KEY;
      const token = jwt.sign(others, key);
      return res
        .json({
          error: false,
          message: "SELECTED",
          token: token,
        })
        .status(200);
    });
  });
}

function register(req, res) {
  const { username, email, password } = req.body;

  if (!username?.trim() || !email?.trim() || !password?.trim()) {
    return res
      .json({
        error: true,
        message: "FIELDS_ARE_REQUIRED",
      })
      .status(400);
  }

  const isExistQuery = `SELECT COUNT(*) as "isExist" FROM Users WHERE username = '${username}' OR email = '${email}'`;

  connection.query(isExistQuery, function (err, results) {
    if (err) {
      console.log(err);
      return res
        .json({
          error: true,
          message: "QUERY_ERROR",
        })
        .status(500);
    }

    if (results[0].isExist != 0) {
      return res
        .json({
          error: true,
          message: "USER_ALREADY_EXISTS",
        })
        .status(400);
    }

    const salt = bcrypt.genSaltSync(8);
    const hashPassword = bcrypt.hashSync(password, salt);

    const createUserQuery = `INSERT INTO Users (username, email, hashPassword) VALUES ('${username}', '${email}', '${hashPassword}')`;

    connection.query(
      createUserQuery,
      function (createUserError, createUserResult) {
        if (createUserError) {
          console.log(createUserError);
          return res.json({ error: true, message: "QUERY_ERROR" });
        }
        if (createUserResult.affectedRows == 0) {
          return res.json({ error: true, message: "CAN_NOT_CREATE_THIS_USER" });
        }
        return res.json({ error: false, message: "USER_CREATED" });
      }
    );
  });
}

module.exports = { login, register };
