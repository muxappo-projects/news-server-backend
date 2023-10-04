const express = require("express");
const app = express();
const {
  getTopics,
  getAllEndpoints,
  getArticleByID,
  getAllArticles,
  getCommentsByArticle,
  postComment,
} = require("./controllers/controllers.js");

app.use(express.json());

// GET requests
app.get("/api", getAllEndpoints);
app.get("/api/topics", getTopics);
app.get("/api/articles/:article_id", getArticleByID);
app.get("/api/articles", getAllArticles);
app.get("/api/articles/:article_id/comments", getCommentsByArticle);

// POST/PATCH requests
app.post("/api/articles/:article_id/comments", postComment);

app.use((req, res, next) => {
  const error = new Error("Endpoint does not exist");
  error.status = 404;
  next(error);
});

// error handling

app.use((err, req, res, next) => {
  let errStatus;
  switch (err.code) {
    case "22P02":
      errStatus = 400;
      err.message = "Invalid input format";
      break;

    case "23502":
      errStatus = 400;
      err.message = "Required field(s) missing";
      break;

    case "23503":
      errStatus = 404;
      err.message = "Not found";
      break;

    default:
      return next(err);
  }
  res.status(errStatus).send({ msg: err.message });
});

app.use((err, req, res, next) => {
  res.status(err.status).send({ msg: err.message });
});

module.exports = app;
