const { decodeJWT, verifyJWT } = require("../utils/jwtHelper");

const authMiddleware =
  ({ configurations }) =>
  async (req, res, next) => {
    const reloginResponse = {
      success: false,
      relogin: true,
      data: {
        error: "Authorization Failed, Please Login Again",
      },
    };

    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      return res.status(401).send({ code: 401, message: "Invalid Credentials." });
    }

    if (authHeader.startsWith("Bearer ")) {
      const bearerAuth = authHeader.split(" ")[1];
      if (!bearerAuth) {
        return res.status(403).send(reloginResponse);
      }

      let userData;
      try {
        const validJWT = verifyJWT(bearerAuth);

        if (!validJWT.valid) {
          return res.status(403).send(reloginResponse);
        }
        userData = validJWT.decoded;
      } catch (error) {
        console.log(error);
        return res.status(403).send(reloginResponse);
      }

      req.httpContext = {
        ...(req.httpContext || {}),
        isAuthenticated: true,
        user_id: userData._id,
        organizationId: userData.organizationId,
        organizationUserId: userData.organizationUserId,
        organizationAdmin: userData.organizationAdmin,
        permissions: userData.permissions,
        isAdmin: userData.isAdmin,
        rememberMe: userData.rememberMe || false,
      };
    } else if (authHeader.startsWith("Basic ")) {
      const basicAuth = authHeader.split(" ")[1];
      if (!basicAuth) {
        return res.status(401).send({ code: 401, message: "Invalid Credentials." });
      }

      // Extract credentials from the Authorization header
      const base64Credentials = authHeader.split(" ")[1];
      const credentials = Buffer.from(base64Credentials, "base64").toString("ascii");
      const [authUsername, authPassword] = credentials.split(":");

      // Check if credentials match
      if (authUsername !== configurations.clientId && authPassword !== configurations.clientSecret) {
        res.set("WWW-Authenticate", 'Basic realm="Authentication Required"');
        return res.status(401).send({ code: 401, message: "Invalid Credentials." });
      }

      req.httpContext = {
        ...(req.httpContext || {}),
        isAuthenticated: true,
      };
    }

    next();
  };

module.exports = authMiddleware;
