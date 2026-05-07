const router = require("express").Router();
const { body, param, validationResult } = require("express-validator");
const projectController = require("./controller");
const verifyToken = require("../../middelwares/verifyToken");
const checkRole = require("../../middelwares/checkRole");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
};

router
  .route("/")
  .get(verifyToken, projectController.getAll)
  .post(
    verifyToken,
    checkRole("admin"),
    body("name").trim().notEmpty().withMessage("Project name is required"),
    body("description").trim().notEmpty().withMessage("Description is required"),
    body("managerId").isInt().withMessage("Manager ID must be a number"),
    validate,
    projectController.create
  );

router
  .route("/:id")
  .get(verifyToken, projectController.getOneProject)
  .delete(verifyToken, checkRole("admin"), projectController.deleteProject)
  .put(verifyToken, projectController.update);

router.route("/:id/tasks").get(verifyToken, projectController.getAllTasks);
router.route("/:id/statistics").get(verifyToken, projectController.getStatistics);
router.route("/:id/users").get(verifyToken, projectController.getAllUsers);
router.route("/:projectId/users/:userId").delete(
  verifyToken,
  param("projectId").isInt().withMessage("Project ID must be a number"),
  param("userId").isInt().withMessage("User ID must be a number"),
  validate,
  projectController.removeUser
);
router.route("/addUser").post(verifyToken, projectController.addUser);
router.route("/:id/manager").put(verifyToken, checkRole("admin"), projectController.assignManager);

module.exports = router;
