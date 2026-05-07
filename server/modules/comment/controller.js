const Comment = require("./model");
const Task = require("../task/model");
const Project = require("../project/model");
const User = require("../user/model");
const errorHandler = require("../../utils/errorHandler");

const getComments = async (req, res) => {
  try {
    const { taskId } = req.params;

    // Optimization: Eager load project with users in single query
    const task = await Task.findByPk(taskId, {
      include: [{
        model: Project,
        include: [{ model: User, as: 'Users', attributes: ['id'] }]
      }]
    });

    if (!task) return errorHandler.notFound(res, "Task not found");

    const project = task.project;

    // Check access permission using eager-loaded users
    if (req.userRole !== "admin" && project.managerId !== req.userId) {
      const projectUsers = project.Users || [];
      const isMember = projectUsers.some((u) => u.id === req.userId);
      if (!isMember) {
        return errorHandler.forbidden(res, "You are not a member of this project");
      }
    }

    const comments = await Comment.findAll({
      where: { taskId },
      include: [
        { model: User, attributes: ["id", "fullName", "photo"] },
      ],
      order: [["createdAt", "ASC"]],
    });
    res.json(comments);
  } catch (error) {
    errorHandler.internalError(res, error, "Failed to retrieve comments");
  }
};

const createComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { text } = req.body;

    // Optimization: Eager load project with users in single query
    const task = await Task.findByPk(taskId, {
      include: [{
        model: Project,
        include: [{ model: User, as: 'Users', attributes: ['id'] }]
      }]
    });

    if (!task) {
      return errorHandler.notFound(res, "Task not found");
    }

    // Check if user is admin, manager or project member using eager-loaded users
    const project = task.project;
    if (req.userRole !== "admin" && project.managerId !== req.userId) {
      const projectUsers = project.Users || [];
      const isMember = projectUsers.some((u) => u.id === req.userId);
      if (!isMember) {
        return errorHandler.forbidden(res, "You are not a member of this project");
      }
    }

    // Get the current user data for immediate response
    const user = await User.findByPk(req.userId, {
      attributes: ["id", "fullName", "photo"]
    });

    // Create comment
    const comment = await Comment.create({
      text,
      userId: req.userId,
      taskId,
    });

    // Return comment with user data (avoid extra fetch)
    const result = {
      id: comment.id,
      text: comment.text,
      userId: comment.userId,
      taskId: comment.taskId,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      User: user
    };

    res.status(201).json(result);
  } catch (error) {
    errorHandler.internalError(res, error, "Failed to create comment");
  }
};

const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findByPk(id, {
      include: [{ model: Task, include: [{ model: Project }] }],
    });

    if (!comment) {
      return errorHandler.notFound(res, "Comment not found");
    }

    const isAuthor = comment.userId === req.userId;
    const isAdmin = req.userRole === "admin";
    const isManager = comment.task.project.managerId === req.userId;

    if (!isAuthor && !isAdmin && !isManager) {
      return errorHandler.forbidden(res, "You cannot delete this comment");
    }

    await Comment.destroy({ where: { id } });
    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    errorHandler.internalError(res, error, "Failed to delete comment");
  }
};

module.exports = { getComments, createComment, deleteComment };
