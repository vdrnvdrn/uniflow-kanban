const express = require("express");
const { Op } = require("sequelize");
const Project = require("./model");
const Task = require("../task/model");
const User = require("../user/model");
const Comment = require("../comment/model");
const errorHandler = require("../../utils/errorHandler");

const getAll = async (req, res) => {
  try {
    const { userRole, userId } = req;
    if (userRole === "admin") {
      // Optimization: Use include to eager load tasks in single query
      const projects = await Project.findAll({
        include: [
          { model: User, as: "manager", attributes: ["id", "fullName", "photo"] },
          { model: Task, attributes: ["id", "state"] } // Load tasks eagerly
        ],
      });

      // Process all projects in memory (no additional queries)
      const results = projects.map((project) => {
        const tasks = project.Tasks || []; // Use eager-loaded tasks
        const total = tasks.length;
        const done = tasks.filter((t) => t.state === "Done").length;
        const completionPercent = total > 0 ? Math.floor((done / total) * 100) : 0;
        return {
          id: project.id,
          name: project.name,
          description: project.description,
          managerId: project.managerId,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
          manager: project.manager,
          completionPercent,
          totalTasks: total,
          doneTasks: done,
        };
      });

      return res.status(200).json(results);
    }
    if (userRole === "manager") {
      const projects = await Project.findAll({
        where: { managerId: userId },
        include: [
          { model: User, as: "manager", attributes: ["id", "fullName", "photo"] },
          { model: Task, attributes: ["id", "state"] } // Load tasks eagerly
        ]
      });

      // Process projects in memory with eager-loaded tasks
      const results = projects.map((project) => {
        const tasks = project.Tasks || [];
        const total = tasks.length;
        const done = tasks.filter((t) => t.state === "Done").length;
        const completionPercent = total > 0 ? Math.floor((done / total) * 100) : 0;
        return {
          id: project.id,
          name: project.name,
          description: project.description,
          managerId: project.managerId,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
          manager: project.manager,
          completionPercent,
          totalTasks: total,
          doneTasks: done,
        };
      });

      return res.status(200).json(results);
    }
    return res.status(200).json([]);
  } catch (err) {
    errorHandler.internalError(res, err, "Failed to retrieve projects");
  }
};

const create = async (req, res) => {
  try {
    const { name, description, managerId } = req.body;
    const result = await Project.create({ name, description, managerId });
    res.status(201).json(result);
  } catch (err) {
    errorHandler.internalError(res, err, "Failed to create project");
  }
};

const getOneProject = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Project.findByPk(id, {
      include: [
        { model: User, as: "manager", attributes: ["id", "fullName", "photo"] },
      ],
    });
    if (!result) {
      return errorHandler.notFound(res, "Project not found");
    }
    res.status(200).json(result);
  } catch (error) {
    errorHandler.internalError(res, error, "Failed to retrieve project");
  }
};

const checkProjectAccess = async (project, req) => {
  if (req.userRole === "admin") return true;
  if (project.managerId === req.userId) return true;
  const projectUsers = await project.getUsers();
  return projectUsers.some((u) => u.id === req.userId);
};

const getAllTasks = async (req, res) => {
  try {
    const { id } = req.params;
    const { state, userId, search, deadline_from, deadline_to, assignedTo } = req.query;

    const project = await Project.findByPk(id);
    if (!project) return errorHandler.notFound(res, "Project not found");
    if (!(await checkProjectAccess(project, req))) {
      return errorHandler.forbidden(res, "No access to this project");
    }

    // Build where clause for filtering
    const where = {};

    // Filter by state (comma-separated values)
    if (state) {
      const states = state.split(',').map(s => s.trim());
      // Validate that all states are valid
      const validStates = ['Todo', 'Doing', 'Done'];
      const filteredStates = states.filter(s => validStates.includes(s));
      if (filteredStates.length > 0) {
        where.state = { [Op.in]: filteredStates };
      }
    }

    // Filter by userId (assigned to specific user)
    if (userId && !isNaN(userId)) {
      where.userId = parseInt(userId);
    }

    // Filter by assignedTo=current (current user's tasks)
    if (assignedTo === 'current') {
      where.userId = req.userId;
    }

    // Search in name and description
    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      where[Op.or] = [
        { name: { [Op.like]: searchTerm } },
        { description: { [Op.like]: searchTerm } }
      ];
    }

    // Filter by deadline range
    if (deadline_from) {
      where.deadline = { ...where.deadline, [Op.gte]: deadline_from };
    }
    if (deadline_to) {
      where.deadline = { ...where.deadline, [Op.lte]: deadline_to };
    }

    // Add projectId filter to ensure tasks belong to this project
    where.projectId = id;

    const tasks = await Task.findAll({
      where,
      include: [{
        model: User,
        as: 'user',
      }]
    });

    const taskIds = tasks.map((t) => t.id);
    const commentCountMap = {};
    if (taskIds.length > 0) {
      const comments = await Comment.findAll({
        where: { taskId: taskIds },
        attributes: ['taskId'],
        raw: true,
      });
      comments.forEach((c) => {
        commentCountMap[c.taskId] = (commentCountMap[c.taskId] || 0) + 1;
      });
    }
    const tasksWithCounts = tasks.map((t) => ({
      ...t.toJSON(),
      commentCount: commentCountMap[t.id] || 0,
    }));
    res.json(tasksWithCounts);
  } catch (err) {
    errorHandler.internalError(res, err, "Failed to retrieve tasks");
  }
};

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findByPk(id);
    if (!project) {
      return errorHandler.notFound(res, "Project not found");
    }
    if (req.userRole !== "admin" && project.managerId !== req.userId) {
      return errorHandler.forbidden(res, "Only admin or project manager can delete this project");
    }
    const result = await Project.destroy({ where: { id: id } });
    res.json({ message: "Project deleted successfully", result });
  } catch (err) {
    errorHandler.internalError(res, err, "Failed to delete project");
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findByPk(id);
    if (!project) {
      return errorHandler.notFound(res, "Project not found");
    }
    if (req.userRole !== "admin" && project.managerId !== req.userId) {
      return errorHandler.forbidden(res, "Only admin or project manager can edit this project");
    }
    const result = await Project.update(
      { name: req.body.name, description: req.body.description },
      { where: { id: id } }
    );
    res.json({ message: "Project updated successfully", result });
  } catch (err) {
    errorHandler.internalError(res, err, "Failed to update project");
  }
};

const addUser = async (req, res) => {
  try {
    const { userId: targetUserId, projectId } = req.body;
    const project = await Project.findByPk(projectId);
    if (!project) {
      return errorHandler.notFound(res, "Project not found");
    }
    if (req.userRole !== "admin" && project.managerId !== req.userId) {
      return errorHandler.forbidden(res, "Only admin or project manager can add users");
    }
    await project.addUser(targetUserId);
    res.status(200).json({ message: "User added to project successfully" });
  } catch (error) {
    errorHandler.internalError(res, error, "Failed to add user to project");
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findByPk(id);
    if (!project) return errorHandler.notFound(res, "Project not found");
    if (!(await checkProjectAccess(project, req))) {
      return errorHandler.forbidden(res, "No access to this project");
    }
    const users = await project.getUsers();
    res.json(users);
  } catch (err) {
    errorHandler.internalError(res, err, "Failed to retrieve project users");
  }
};

const removeUser = async (req, res) => {
  try {
    const { projectId, userId } = req.params;
    const project = await Project.findByPk(projectId);

    if (!project) {
      return errorHandler.notFound(res, "Project not found");
    }

    // Permission check: only admin or project manager can remove users
    if (req.userRole !== "admin" && project.managerId !== req.userId) {
      return errorHandler.forbidden(res, "Only admin or project manager can remove users");
    }

    // Remove the user from the project
    await project.removeUser(parseInt(userId));
    res.status(200).json({ message: "User removed from project successfully" });
  } catch (error) {
    errorHandler.internalError(res, error, "Failed to remove user from project");
  }
};

const assignManager = async (req, res) => {
  try {
    const { id } = req.params;
    const { managerId } = req.body;
    const project = await Project.findByPk(id);
    if (!project) {
      return errorHandler.notFound(res, "Project not found");
    }
    const newManager = await User.findByPk(managerId);
    if (!newManager) {
      return errorHandler.notFound(res, "User not found");
    }
    if (newManager.role !== "manager") {
      return errorHandler.forbidden(res, "Only users with manager role can be assigned as project manager");
    }
    await Project.update({ managerId }, { where: { id } });
    res.json({ message: "Manager assigned successfully" });
  } catch (err) {
    errorHandler.internalError(res, err, "Failed to assign manager");
  }
};

const getStatistics = async (req, res) => {
  try {
    const { id } = req.params;

    // Optimization: Use single query with includes instead of 3 separate queries
    const project = await Project.findByPk(id, {
      include: [
        { model: User, as: 'Users', attributes: ['id', 'fullName', 'photo', 'email', 'status'] },
      ]
    });

    if (!project) return errorHandler.notFound(res, "Project not found");
    if (!(await checkProjectAccess(project, req))) {
      return errorHandler.forbidden(res, "No access to this project");
    }

    // Fetch all tasks with user association in one query
    const tasks = await Task.findAll({
      where: { projectId: id },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'fullName', 'photo', 'email', 'status']
      }]
    });

    const projectUsers = project.Users || [];

    const userMap = {};
    for (const u of projectUsers) {
      userMap[u.id] = { id: u.id, fullName: u.fullName, photo: u.photo, email: u.email, status: u.status };
    }
    for (const t of tasks) {
      if (t.user && !userMap[t.user.id]) {
        userMap[t.user.id] = { id: t.user.id, fullName: t.user.fullName, photo: t.user.photo, email: t.user.email, status: t.user.status };
      }
    }
    const users = Object.values(userMap);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let todoCount = 0;
    let doingCount = 0;
    let doneCount = 0;
    let overdueCount = 0;

    const ratings = {};
    const memberStats = {};
    const overdueTasks = [];
    const upcomingTasks = [];

    for (const task of tasks) {
      if (task.state === "Done") doneCount++;
      else if (task.state === "Doing") doingCount++;
      else todoCount++;

      const uid = task.userId;
      if (uid) {
        if (!memberStats[uid]) {
          memberStats[uid] = { totalAssigned: 0, completed: 0, onTimeCount: 0 };
        }
        memberStats[uid].totalAssigned++;
      }

      if (task.state === "Done") {
        if (uid) memberStats[uid].completed++;
        if (task.deadline) {
          const doneAt = new Date(task.updatedAt);
          const deadline = new Date(task.deadline);
          const diff = Math.floor((doneAt - deadline) / (1000 * 60 * 60 * 24));
          if (diff < 2) {
            ratings[uid] = (ratings[uid] || 0) + 5;
            if (uid) memberStats[uid].onTimeCount++;
          } else if (diff < -2) {
            ratings[uid] = (ratings[uid] || 0) - 2;
          } else {
            ratings[uid] = (ratings[uid] || 0) + 2;
          }
        } else {
          ratings[uid] = (ratings[uid] || 0) + 5;
          if (uid) memberStats[uid].onTimeCount++;
        }
      } else {
        if (task.deadline) {
          const deadline = new Date(task.deadline);
          deadline.setHours(0, 0, 0, 0);
          const diffDays = Math.floor((deadline - today) / (1000 * 60 * 60 * 24));

          const assignedUser = task.user ? {
            fullName: task.user.fullName,
            photo: task.user.photo,
          } : null;

          if (diffDays < 0) {
            overdueCount++;
            overdueTasks.push({
              taskId: task.id,
              taskName: task.name,
              deadline: task.deadline,
              daysOverdue: Math.abs(diffDays),
              state: task.state,
              assignedUser,
            });
          } else if (diffDays <= 7) {
            upcomingTasks.push({
              taskId: task.id,
              taskName: task.name,
              deadline: task.deadline,
              daysRemaining: diffDays,
              state: task.state,
              assignedUser,
            });
          }
        }
      }
    }

    const totalTasks = tasks.length;
    const completionPercent = totalTasks > 0 ? Math.floor((doneCount / totalTasks) * 100) : 0;

    overdueTasks.sort((a, b) => b.daysOverdue - a.daysOverdue);
    upcomingTasks.sort((a, b) => a.daysRemaining - b.daysRemaining);

    const memberBreakdown = users.map((user) => {
      const ms = memberStats[user.id] || { totalAssigned: 0, completed: 0, onTimeCount: 0 };
      const completionRate = ms.totalAssigned > 0 ? Math.round((ms.completed / ms.totalAssigned) * 100) : 0;
      const onTimeRate = ms.completed > 0 ? Math.round((ms.onTimeCount / ms.completed) * 100) : 0;
      return {
        userId: user.id,
        fullName: user.fullName,
        photo: user.photo,
        email: user.email,
        status: user.status,
        totalAssigned: ms.totalAssigned,
        completed: ms.completed,
        completionRate,
        onTimeCount: ms.onTimeCount,
        onTimeRate,
        rating: ratings[user.id] || 0,
      };
    });

    memberBreakdown.sort((a, b) => b.rating - a.rating);

    res.json({
      summary: {
        totalTasks,
        completedTasks: doneCount,
        inProgressTasks: doingCount,
        todoTasks: todoCount,
        overdueTasks: overdueCount,
        completionPercent,
      },
      memberBreakdown,
      deadlineHealth: {
        overdue: overdueTasks,
        upcoming: upcomingTasks,
      },
    });
  } catch (err) {
    errorHandler.internalError(res, err, "Failed to retrieve project statistics");
  }
};

module.exports = {
  getAll,
  create,
  getOneProject,
  getAllTasks,
  deleteProject,
  update,
  addUser,
  getAllUsers,
  removeUser,
  assignManager,
  getStatistics,
};
