const httpStatus = require('http-status');

class APIError extends Error {
  constructor(message, status = httpStatus.INTERNAL_SERVER_ERROR, stack) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    this.status = status;
    this.stack = stack;
    this.stack || Error.captureStackTrace(this, this.constructor.name);
  }
}

module.exports = APIError;