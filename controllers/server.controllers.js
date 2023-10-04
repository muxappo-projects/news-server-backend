const {
  fetchTopics,
  fetchEndpoints,
  fetchArticleByID,
  fetchAllArticles,
  fetchCommentsByArticle,
  createComment,
  updateArticle,
} = require("../models/models.js");

exports.getAllEndpoints = (req, res, next) => {
  fetchEndpoints()
    .then((endpoints) => {
      res.status(200).send({ endpoints });
    })
    .catch((err) => next(err));
};

exports.getTopics = (req, res, next) => {
  fetchTopics()
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch((err) => next(err));
};

exports.getArticleByID = ({ params: { article_id } }, res, next) => {
  fetchArticleByID(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => next(err));
};

exports.getAllArticles = (req, res, next) => {
  fetchAllArticles()
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch((err) => next(err));
};

exports.getCommentsByArticle = ({ params: { article_id } }, res, next) => {
  fetchCommentsByArticle(article_id)
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch((err) => next(err));
};

exports.postComment = ({ body, params: { article_id } }, res, next) => {
  createComment(body, article_id)
    .then((created_comment) => {
      res.status(201).send({ created_comment });
    })
    .catch((err) => next(err));
};

exports.patchArticle = ({ body, params: { article_id } }, res, next) => {
  updateArticle(body, article_id)
    .then((updated_article) => {
      res.status(200).send({ updated_article });
    })
    .catch((err) => next(err));
};
