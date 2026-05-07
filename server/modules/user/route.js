const router = require("express").Router();
const { body, param, validationResult } = require("express-validator");

const verifyToken = require("../../middelwares/verifyToken.js");
const checkRole = require("../../middelwares/checkRole.js");

const {
  signOutList,
  verifySession,
} = require("../../middelwares/blackList.js");

const userController = require("./controller");

// Validation middleware helper
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
};

// Auth routes
router.post(
  "/auth/signin",
  body("username").trim().notEmpty().withMessage("Username is required"),
  body("password").notEmpty().withMessage("Password is required"),
  validate,
  userController.signin
);

router.post(
  "/auth/signup",
  body("fullName").trim().notEmpty().withMessage("Full name is required"),
  body("username").trim().notEmpty().withMessage("Username is required")
    .isLength({ min: 3 }).withMessage("Username must be at least 3 characters"),
  body("email").trim().isEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  validate,
  userController.signup
);

router.get("/auth/signout", signOutList, userController.signout);

// User routes
router.get("/user/:id/projects", verifyToken, userController.userProjects);
router.get("/user/:id/projectin", verifyToken, userController.userProjectsMember);

router.post("/user/search", verifyToken, userController.search);

router.get("/user/mydata", verifySession, verifyToken, userController.myData);
router.get("/user/me/active-tasks-count", verifyToken, userController.myActiveTasksCount);
router.get("/user/me/digest", verifyToken, userController.myDigest);

router.put(
  "/user/:id/status",
  param("id").isInt().withMessage("User ID must be a valid integer"),
  body("status").isIn(["available", "busy", "away"]).withMessage("Invalid status"),
  validate,
  verifyToken,
  userController.updateStatus
);
router.get("/user/achievements", verifyToken, userController.getAchievements);

// Admin routes
router.get("/admin/users", verifyToken, checkRole("admin"), userController.getAllUsers);
router.get("/admin/stats", verifyToken, checkRole("admin"), userController.adminStats);
router.get("/admin/digest", verifyToken, checkRole("admin"), userController.adminDigest);
router.put("/admin/users/:id/role", verifyToken, checkRole("admin"), userController.updateUserRole);
router.put(
  "/admin/users/:id/password",
  verifyToken,
  checkRole("admin"),
  param("id").isInt().withMessage("User ID must be a valid integer"),
  body("newPassword").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  validate,
  userController.adminResetPassword
);

// Profile routes
router.get(
  "/user/:id",
  param("id").isInt().withMessage("User ID must be a valid integer"),
  validate,
  verifyToken,
  userController.getProfile
);

router.put(
  "/user/:id",
  param("id").isInt().withMessage("User ID must be a valid integer"),
  body("fullName").optional().trim().notEmpty().withMessage("Full name cannot be empty")
    .isLength({ max: 100 }).withMessage("Full name must be less than 100 characters"),
  body("profession").optional().trim().isLength({ max: 500 }).withMessage("Profession must be less than 500 characters"),
  body("email").optional().trim().isEmail().withMessage("Valid email is required"),
  validate,
  verifyToken,
  userController.updateProfile
);

router.put(
  "/user/:id/photo",
  param("id").isInt().withMessage("User ID must be a valid integer"),
  validate,
  verifyToken,
  userController.updatePhoto
);

router.put(
  "/user/:id/password",
  param("id").isInt().withMessage("User ID must be a valid integer"),
  body("oldPassword").notEmpty().withMessage("Old password is required"),
  body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters"),
  validate,
  verifyToken,
  userController.changePassword
);

module.exports = router;
