class BytePlusController {
  constructor({ bytePlusService, errorResponseMessage }) {
    this.bytePlusService = bytePlusService;
    this.errorResponseMessage = errorResponseMessage;
  }

  async getVideoAuthToken(req, res) {
    const { vid } = req.params;
    const response = await this.bytePlusService.getVideoAuthToken({ vid });
    if (response.success) {
      res.status(200).send(response);
    } else {
      res.status(400).send(this.errorResponseMessage.serverError(response.message));
    }
  }

  async getMediaList(req, res) {
    const response = await this.bytePlusService.getMediaList();
    if (response.success) {
      res.status(200).send(response);
    } else {
      res.status(400).send(this.errorResponseMessage.serverError(response.message));
    }
  }
}

module.exports = BytePlusController;
