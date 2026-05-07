const router = require("express").Router();
const { param, validationResult } = require("express-validator");
const verifyToken = require("../../middelwares/verifyToken");
const actionController = require("./controller");

// Validation middleware helper
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
};

// Get all actions for a specific task
router.get(
  "/task/:taskId/actions",
  param("taskId").isInt().withMessage("Task ID must be a valid integer"),
  validate,
  verifyToken,
  actionController.getTaskActions
);

// Get all actions for a specific project
router.get(
  "/project/:projectId/actions",
  param("projectId").isInt().withMessage("Project ID must be a valid integer"),
  validate,
  verifyToken,
  actionController.getProjectActions
);

// Get action statistics for a user
router.get(
  "/user/:userId/action-stats",
  param("userId").isInt().withMessage("User ID must be a valid integer"),
  validate,
  verifyToken,
  actionController.getUserActionStats
);

module.exports = router;
