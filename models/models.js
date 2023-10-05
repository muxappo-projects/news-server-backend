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
  console.log(id);
  const getQuery = `
  SELECT
    articles.author, articles.article_id,
    articles.title, articles.topic,
    articles.created_at, articles.votes,
    articles.article_img_url,
  COUNT (comments.comment_id) AS comment_count
  FROM articles
  LEFT JOIN comments ON articles.article_id = comments.article_id
  WHERE articles.article_id = $1
  GROUP BY articles.article_id;
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

exports.fetchAllArticles = (sortby = "date") => {
  const validSortbys = {
    date: "created_at",
    topic: "topic",
  };

  if (!sortby in validSortbys) {
    return Promise.reject({
      status: 400,
      message: "Invalid sort query",
    });
  }
  const getQuery = `
  SELECT
    articles.author, articles.title,
    articles.article_id, articles.topic,
    articles.created_at, articles.votes,
    articles.article_img_url,
  COUNT(comments.comment_id) AS comment_count
  FROM articles
  LEFT JOIN comments ON articles.article_id = comments.article_id
  GROUP BY articles.article_id
  ORDER BY ${validSortbys[sortby]} DESC;
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
          return rows;
        });
    });
};

exports.createComment = ({ commentBody, username }, id) => {
  const postQuery = `INSERT INTO comments
      (body, author, article_id)
      VALUES
      ($1, $2, $3)
      RETURNING *;`;
  const values = [commentBody, username, id];

  return db.query(postQuery, values).then(({ rows }) => {
    return rows[0];
  });
};

exports.updateArticle = ({ inc_votes }, id) => {
  const updateQuery = `
      UPDATE articles
      SET votes = votes + $1
      WHERE article_id = $2
      RETURNING *;
      `;
  const values = [inc_votes, id];

  return db.query(updateQuery, values).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({
        status: 404,
        message: "Not found",
      });
    }
    return rows[0];
  });
};

exports.removeComment = (id) => {
  const delQuery = `
  DELETE FROM comments
  WHERE comment_id = $1
  `;

  return db.query(delQuery, [id]).then(({ rowCount }) => {
    if (rowCount === 0) {
      return Promise.reject({
        status: 404,
        message: "No rows deleted",
      });
    }
  });
};

exports.fetchAllUsers = () => {
  const getQuery = `
  SELECT * FROM users;
  `;

  return db.query(getQuery).then(({ rows }) => {
    return rows;
  });
};
