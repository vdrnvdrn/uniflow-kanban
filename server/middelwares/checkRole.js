const User = require("../modules/user/model");

const checkRole = (...roles) => {
  return async (req, res, next) => {
    try {
      if (req.userRole && roles.includes(req.userRole)) {
        return next();
      }
      const user = await User.findByPk(req.userId);
      if (!user || !roles.includes(user.role)) {
        return res.status(403).json({ message: "Forbidden: insufficient permissions" });
      }
      req.userRole = user.role;
      next();
    } catch (error) {
      res.status(500).json({ message: "Error checking permissions", error });
    }
  };
};

module.exports = checkRole;
