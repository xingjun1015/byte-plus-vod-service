class ErrorResponseMessage {
  constructor({}) {}

  notFoundError() {
    return { code: 404, message: "No record found." };
  }

  forbiddenError(error, debug = true) {
    return { code: 403, message: !debug ? "Internal server error." : `${error}` };
  }

  serverError(error, debug = true) {
    return {
      code: 9999,
      message: !debug ? "Internal server error." : `${error}`,
    };
  }

  dialogError(error, debug = true) {
    return {
      code: 400,
      message: !debug ? "Internal server error." : `${error}`,
      data: {
        dialog: true,
      },
    };
  }
}

module.exports = ErrorResponseMessage;
