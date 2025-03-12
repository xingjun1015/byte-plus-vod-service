const express = require("express");
const bytePlusController = require("../controllers/bytePlusController");
const { makeInvoker } = require("awilix-express");

const router = express.Router();

router.get("/info", makeInvoker(bytePlusController)("getBytePlusInfo"));

router.get("/medias", makeInvoker(bytePlusController)("getMediaList"));

router.get("/token/:vid", makeInvoker(bytePlusController)("getVideoAuthToken"));

router.get("/upload-token", makeInvoker(bytePlusController)("getUploadToken"));

module.exports = router;
