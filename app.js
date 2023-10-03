const express = require("express");
const app = express();
const {
  getTopics,
  getAllEndpoints,
  getArticleByID,
  getAllArticles,
  getCommentsByArticle,
} = require("./controllers/controllers.js");

// GET requests
app.get("/api", getAllEndpoints);
app.get("/api/topics", getTopics);
app.get("/api/articles/:article_id", getArticleByID);
app.get("/api/articles", getAllArticles);
app.get("/api/articles/:article_id/comments", getCommentsByArticle);

app.use((req, res, next) => {
  const error = new Error("endpoint does not exist");
  error.status = 404;
  next(error);
});

// error handling

app.use((err, req, res, next) => {
  if (err.code === "22P02") {
    err.message = "Bad request";
    res.status(400).send({ msg: err.message });
  }
  next(err);
});

app.use((err, req, res, next) => {
  res.status(err.status).send({ msg: err.message });
});

module.exports = app;
