const express = require("express");
const app = express();
const {
  create404,
  handlePSQLErrors,
  noEndpoint,
} = require("./controllers/error.controllers.js");

const {
  getTopics,
  getAllEndpoints,
  getArticleByID,
  getAllArticles,
  getCommentsByArticle,
  postComment,
  patchArticle,
  deleteComment,
} = require("./controllers/server.controllers.js");

app.use(express.json());

// GET requests
app.get("/api", getAllEndpoints);
app.get("/api/topics", getTopics);
app.get("/api/articles/:article_id", getArticleByID);
app.get("/api/articles", getAllArticles);
app.get("/api/articles/:article_id/comments", getCommentsByArticle);

// POST/PATCH requests
app.post("/api/articles/:article_id/comments", postComment);
app.patch("/api/articles/:article_id", patchArticle);

// DELETE requests
app.delete("/api/comments/:comment_id", deleteComment);

// error handling
app.use(create404);

app.use(handlePSQLErrors);

app.use(noEndpoint);

module.exports = app;
