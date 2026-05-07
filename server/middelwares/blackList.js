const blackList = [];

const getToken = (req) => {
  const authHeader = req.headers["authorization"];
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return req.headers["x-token"];
};

const signOutList = (req, res, next) => {
  const token = getToken(req);
  if (token) blackList.push(token);
  next();
};

const verifySession = (req, res, next) => {
  const token = getToken(req);
  if (blackList.includes(token)) {
    return res.status(401).json({ message: "You are signed out" });
  }
  next();
};

module.exports = { signOutList, verifySession };
