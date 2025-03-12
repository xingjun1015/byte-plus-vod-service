const appSettings = require("./appSettings");
const { createContainer, asValue, asClass, asFunction } = require("awilix");
const utils = require("./utils");

// Dependency Injection Container
const container = createContainer();

container.register({
  configurations: asValue(appSettings),
  errorResponseMessage: asClass(utils.errorResponseMessage),
});

const path = require("path");

container.loadModules([path.join(__dirname, "database/*.js"), path.join(__dirname, "services/*.js")]);

module.exports = container;
