const Task = require("./model");
const Action = require("../action/model");
const Project = require("../project/model");
const User = require("../user/model");
const errorHandler = require("../../utils/errorHandler");

const getAll = async (req, res) => {
  try {
    const result = await Task.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'fullName', 'photo']
      }]
    });
    res.status(200).json(result);
  } catch (err) {
    errorHandler.internalError(res, err, "Failed to retrieve tasks");
  }
};

const create = async (req, res) => {
  try {
    const project = await Project.findByPk(req.body.projectId);
    if (!project) {
      return errorHandler.notFound(res, "Project not found");
    }
    if (req.userRole !== "admin" && project.managerId !== req.userId) {
      return errorHandler.forbidden(res, "Only admin or project manager can create tasks");
    }
    const result = await Task.create(req.body);
    await Action.create({
      state: req.body.state,
      taskId: result.id,
      userId: req.body.userId,
    });
    res.status(201).json(result);
  } catch (err) {
    errorHandler.internalError(res, err, "Failed to create task");
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findByPk(id, { include: [{ model: Project }] });
    if (!task) {
      return errorHandler.notFound(res, "Task not found");
    }
    if (req.userRole !== "admin" && task.project.managerId !== req.userId) {
      return errorHandler.forbidden(res, "Only admin or project manager can delete tasks");
    }
    const result = await Task.destroy({ where: { id: id } });
    res.status(202).json({ message: "Task deleted successfully", result });
  } catch (err) {
    errorHandler.internalError(res, err, "Failed to delete task");
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findByPk(id, {
      include: [{ model: Project }],
    });
    if (!task) {
      return errorHandler.notFound(res, "Task not found");
    }

    const isAdminOrManager =
      req.userRole === "admin" || task.project.managerId === req.userId;

    if (isAdminOrManager) {
      const result = await Task.update(
        {
          name: req.body.name,
          description: req.body.description,
          state: req.body.state,
        },
        { where: { id: id } }
      );
      await Action.create({
        state: req.body.state,
        taskId: id,
        userId: task.userId,
      });
      return res.json({ message: "Task updated successfully", result });
    }

    // Regular user: can only update state of their own tasks
    if (task.userId !== req.userId) {
      return errorHandler.forbidden(res, "You can only move your own tasks");
    }
    const result = await Task.update(
      { state: req.body.state },
      { where: { id: id } }
    );
    await Action.create({
      state: req.body.state,
      taskId: id,
      userId: task.userId,
    });
    res.json({ message: "Task updated successfully", result });
  } catch (err) {
    errorHandler.internalError(res, err, "Failed to update task");
  }
};

module.exports = { getAll, create, remove, updateTask };
