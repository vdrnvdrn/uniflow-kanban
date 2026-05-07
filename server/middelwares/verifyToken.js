const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  // Support both Authorization: Bearer <token> and legacy x-token header
  let token = null;
  const authHeader = req.headers["authorization"];
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.slice(7);
  } else {
    token = req.headers["x-token"];
  }

  if (!token) {
    return res.status(403).send({
      message: "No token provided!",
    });
  }

  const secret = process.env.JWT_SECRET || "ourSecret";
  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Unauthorized!",
      });
    }
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  });
};

module.exports = verifyToken;
