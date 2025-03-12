const express = require("express");
const bytePlusController = require("../controllers/bytePlusController");
const { makeInvoker } = require("awilix-express");

const router = express.Router();

router.get("/medias", makeInvoker(bytePlusController)("getMediaList"));

router.get("/:vid", makeInvoker(bytePlusController)("getVideoAuthToken"));

module.exports = router;
