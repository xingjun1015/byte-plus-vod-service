const appSettings = require("./appSettings");
const { createContainer, asValue, asClass, asFunction } = require("awilix");
const utils = require("./utils");
const { vodOpenapi } = require("@byteplus/vcloud-sdk-nodejs");

// Dependency Injection Container
const container = createContainer();

const bytePlusAccessKey = process.env.BYTEPLUS_ACCESSKEY;
const bytePlusSecretKey = process.env.BYTEPLUS_SECRETKEY;

if (!bytePlusAccessKey || !bytePlusSecretKey) {
  throw new Error("BytePlus access key and secret key are required");
}

const bytePlusVodService = vodOpenapi.defaultService;
bytePlusVodService.setAccessKeyId(bytePlusAccessKey);
bytePlusVodService.setSecretKey(bytePlusSecretKey);

container.register({
  configurations: asValue(appSettings),
  bytePlusVodService: asFunction(() => bytePlusVodService).singleton(),
  errorResponseMessage: asClass(utils.errorResponseMessage),
});

const path = require("path");

container.loadModules([path.join(__dirname, "database/*.js"), path.join(__dirname, "services/*.js")]);

module.exports = container;
