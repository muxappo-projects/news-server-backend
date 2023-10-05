exports.create404 = (req, res, next) => {
  const error = Error("Endpoint does not exist");
  error.status = 404;
  next(error);
};

exports.handlePSQLErrors = (err, req, res, next) => {
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
      next(err);
  }
  res.status(errStatus).send({ msg: err.message });
};

exports.noEndpoint = (err, req, res, next) => {
  res.status(err.status).send({ msg: err.message });
};
