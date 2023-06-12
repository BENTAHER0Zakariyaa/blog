const express = require("express");
const app = express();

app.use(express.json());

app.use(require("./routes/auth.routes"));
app.use(require("./routes/category.routes"));
app.use(require("./routes/post.routes"));

module.exports = app;
