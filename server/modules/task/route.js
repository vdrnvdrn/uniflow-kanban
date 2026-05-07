const router = require("express").Router();
const { body, validationResult } = require("express-validator");
const verifyToken = require("../../middelwares/verifyToken.js");
const taskController = require("./controller");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
};

router.route("/")
  .get(verifyToken, taskController.getAll)
  .post(
    verifyToken,
    body("name").trim().notEmpty().withMessage("Task name is required"),
    body("state").isIn(["Todo", "Doing", "Done"]).withMessage("State must be Todo, Doing, or Done"),
    body("projectId").isInt().withMessage("Project ID is required"),
    validate,
    taskController.create
  );

router.route("/:id")
  .delete(verifyToken, taskController.remove)
  .put(verifyToken, taskController.updateTask);

module.exports = router;
