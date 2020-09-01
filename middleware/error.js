const ErrorResponse = require("../utils/errorResponse");

const errorHandler = (err, req, res, next) => {
  let error = {
    ...err
  }

  error.message = err.message

  //Log to console for dev
  console.log(err.red);

  //Mongoose bad objectId (customised error resopnse)
  if (err.name == 'CastError') {
    const message = `Bootcamp not found with id of ${err.value}`;
    error = new ErrorResponse(message, 404)
  }
  //  error response
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });
}

module.exports = errorHandler;