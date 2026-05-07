const Action = require("./model");
const Task = require("../task/model");
const User = require("../user/model");
const Project = require("../project/model");

// Get all actions for a task
const getTaskActions = async (req, res) => {
  try {
    const { taskId } = req.params;

    // Verify task exists and user has access
    const task = await Task.findByPk(taskId, { include: [{ model: Project }] });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check if user is admin, manager, or project member
    const project = task.project;
    if (req.userRole !== "admin" && project.managerId !== req.userId) {
      const projectUsers = await project.getUsers();
      const isMember = projectUsers.some((u) => u.id === req.userId);
      if (!isMember) {
        return res.status(403).json({ message: "Forbidden: you are not a member of this project" });
      }
    }

    const actions = await Action.findAll({
      where: { taskId },
      include: [
        { model: User, attributes: ["id", "fullName", "email"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(actions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all actions for a project
const getProjectActions = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Verify project exists
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if user is admin, manager, or project member
    if (req.userRole !== "admin" && project.managerId !== req.userId) {
      const projectUsers = await project.getUsers();
      const isMember = projectUsers.some((u) => u.id === req.userId);
      if (!isMember) {
        return res.status(403).json({ message: "Forbidden: you are not a member of this project" });
      }
    }

    const tasks = await Task.findAll({ where: { projectId } });
    const taskIds = tasks.map((t) => t.id);

    const actions = await Action.findAll({
      where: { taskId: taskIds },
      include: [
        { model: User, attributes: ["id", "fullName", "email", "photo", "status"] },
        { model: Task, attributes: ["id", "name"] },
      ],
      order: [["createdAt", "DESC"]],
      limit: 100,
    });

    res.json(actions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get action statistics for a user
const getUserActionStats = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const actions = await Action.findAll({
      where: { userId },
      attributes: ["state"],
    });

    const stats = {
      total: actions.length,
      byState: {
        Todo: actions.filter((a) => a.state === "Todo").length,
        Doing: actions.filter((a) => a.state === "Doing").length,
        Done: actions.filter((a) => a.state === "Done").length,
      },
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getTaskActions, getProjectActions, getUserActionStats };
