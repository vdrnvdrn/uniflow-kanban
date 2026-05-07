const router = require("express").Router();
const { body, param, validationResult } = require("express-validator");
const verifyToken = require("../../middelwares/verifyToken");
const commentController = require("./controller");

// Validation middleware helper
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
};

router.route("/task/:taskId/comments")
  .get(
    param("taskId").isInt().withMessage("Task ID must be a valid integer"),
    validate,
    verifyToken,
    commentController.getComments
  )
  .post(
    param("taskId").isInt().withMessage("Task ID must be a valid integer"),
    body("text").trim().notEmpty().withMessage("Comment text is required")
      .isLength({ max: 5000 }).withMessage("Comment text must be less than 5000 characters"),
    validate,
    verifyToken,
    commentController.createComment
  );

router.route("/comment/:id")
  .delete(
    param("id").isInt().withMessage("Comment ID must be a valid integer"),
    validate,
    verifyToken,
    commentController.deleteComment
  );

module.exports = router;
