const db = require("../db/connection.js");
const fs = require("fs/promises");

exports.fetchEndpoints = () => {
  return fs.readFile(`${__dirname}/../endpoints.json`, "utf-8").then((file) => {
    return JSON.parse(file);
  });
};

exports.fetchTopics = () => {
  const getQuery = `SELECT * FROM topics`;

  return db.query(getQuery).then(({ rows }) => {
    return rows;
  });
};

exports.fetchArticleByID = (id) => {
  const getQuery = `
    SELECT * FROM articles
    WHERE article_id = $1
    `;
  return db.query(getQuery, [id]).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({
        status: 404,
        message: "ID does not exist",
      });
    }
    return rows;
  });
};

exports.fetchAllArticles = () => {
  const getQuery = `
  SELECT
    articles.author,
    articles.title,
    articles.article_id,
    articles.topic,
    articles.created_at,
    articles.votes,
    articles.article_img_url,
  COUNT(comments.comment_id) AS comment_count
  FROM articles
  LEFT JOIN comments ON articles.article_id = comments.article_id
  GROUP BY articles.article_id
  ORDER BY created_at DESC
  `;

  return db.query(getQuery).then(({ rows }) => {
    return rows;
  });
};

exports.fetchCommentsByArticle = (id) => {
  return db
    .query("SELECT * FROM articles WHERE article_id = $1", [id])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          message: "Article not found",
        });
      }

      return db
        .query(
          `SELECT * FROM comments
      WHERE article_id = $1
      ORDER BY created_at DESC`,
          [id]
        )
        .then(({ rows }) => {
          if (rows.length === 0) {
            return Promise.reject({
              status: 404,
              message: "No comments found",
            });
          }
          return rows;
        });
    });
};
