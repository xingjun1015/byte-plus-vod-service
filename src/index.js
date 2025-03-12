const cors = require("cors");
const helmet = require("helmet");
const express = require("express");
const bodyParser = require("body-parser");
const { scopePerRequest, inject, loadControllers } = require("awilix-express");

const middlewares = require("./middlewares");
const container = require("./container");
const debug = require("debug")("app:startup");
const http = require("http");
const routes = require("./routes");

const app = express();
app.use(helmet());
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: false }));

// Dependency Injection Container
app.use(scopePerRequest(container));

// Load controllers
app.use(loadControllers("controllers/*.js", { cwd: __dirname }));

app.get("/api/health", (req, res) => res.json({ status: "OK" }));

// middlewares
app.use(inject(middlewares.authMiddleware));

// routes
app.get("/api/openai-key", (req, res) => {
  // Only return the key if the request is authenticated
  res.json({ apiKey: process.env.OPENAI_API_KEY });
});

app.use("/api/byteplus", routes.bytePlusRoutes);

// Listen port
const PORT = process.env.PORT || "3000";
const SERVER_HOST = process.env.SERVER_HOST || "http://localhost";

const server = http.createServer(app);

// Run migrations
server.listen(PORT, () => {
  console.log(`Service running on ${SERVER_HOST}:${PORT}`);
  console.warn(`Swagger docs running on ${SERVER_HOST}:${PORT}/api/docs`);
});

// Error handling on server
server.on("error", (err) => onError(err, PORT));

// Gracefully handle shutdowns
process.on("SIGTERM", () => shutdown(server, "SIGTERM"));
process.on("SIGINT", () => shutdown(server, "SIGINT"));

// Handling uncaught exceptions and unhandled rejections
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  debug("Uncaught Exception:", err);
  shutdown(server, "uncaughtException", 1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  debug("Unhandled Rejection:", reason);
  shutdown(app, "unhandledRejection", 1);
});

// Handle server errors
function onError(error, port) {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof port === "string" ? `Pipe ${port}` : `Port ${port}`;

  // Handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
}

// Gracefully shut down the server
function shutdown(server, signal, exitCode = 0) {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  debug(`Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log("Closed out remaining connections.");
    debug("Closed out remaining connections.");
    process.exit(exitCode);
  });

  // Force shutdown after 5 seconds if not done
  setTimeout(() => {
    console.error("Forcing shutdown after 5 seconds...");
    debug("Forcing shutdown after 5 seconds...");
    process.exit(exitCode);
  }, 5000);
}
