const User = require("./model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const path = require("path");
const { Op, where } = require("sequelize");
const Action = require("../action/model");
const Project = require("../project/model");
const Task = require("../task/model");
const Comment = require("../comment/model");

const ALLOWED_MIMETYPES = ["image/jpeg", "image/png", "image/gif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const signin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({
      where: { username },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isValidPassword = bcrypt.compareSync(password, user.password);

    if (isValidPassword) {
      const secret = process.env.JWT_SECRET || "ourSecret";
      const token = jwt.sign({ id: user.id, role: user.role }, secret, {
        algorithm: "HS256",
        expiresIn: 86400, // 24 hours
      });
      res.json({ token, id: user.id, role: user.role, fullName: user.fullName });
    } else {
      res.status(401).json({ message: "Invalid password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
};

const signup = async (req, res) => {
  const data = { ...req.body };
  data.password = bcrypt.hashSync(req.body.password, 8);
  data.role = "user";

  if (req.files && req.files.image) {
    const { image } = req.files;

    if (!ALLOWED_MIMETYPES.includes(image.mimetype)) {
      return res.status(400).json({ message: "Invalid file type. Only JPEG, PNG, GIF allowed" });
    }
    if (image.size > MAX_FILE_SIZE) {
      return res.status(400).json({ message: "File too large. Max 5MB" });
    }

    const imagePath = path.join(__dirname, "../../storage/images/users/");
    const ext = path.extname(image.name) || "." + image.mimetype.split("/")[1];
    const imageName = crypto.randomBytes(16).toString("hex") + ext;
    await image.mv(path.join(imagePath, imageName));
    data.photo = "images/users/" + imageName;
  }

  try {
    await User.create(data);
    res.send({ message: "User registered successfully!" });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ message: "Username or email already exists" });
    }
    res.status(500).send({ message: error.message });
  }
};

const signout = async (req, res) => {
  try {
    res.status(200).send({
      message: "You've been signed out!",
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const userProjects = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    const projects = await user.getProjects();
    res.json(projects);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const userProjectsMember = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    const projects = await user.getProjectsIn({
      include: [
        { model: User, as: "manager", attributes: ["id", "fullName", "photo"] },
      ],
    });
    res.json(projects);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const search = async (req, res) => {
  try {
    const { query } = req.body;
    const users = await User.findAll({
      where: {
        [Op.and]: {
          [Op.or]: {
            email: { [Op.like]: `%${query}%` },
            fullName: { [Op.like]: `%${query}%` },
          },
          id: { [Op.ne]: req.userId },
        },
      },
    });
    res.json(users);
  } catch (error) {
    res.send(error);
  }
};

const myDigest = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Collect all project IDs the user has access to (managed + member)
    const [projectsManaged, projectsIn] = await Promise.all([
      user.getProjects({ attributes: ["id", "name"] }),
      user.getProjectsIn({ attributes: ["id", "name"] }),
    ]);
    const projectMap = {};
    [...projectsManaged, ...projectsIn].forEach((p) => {
      projectMap[p.id] = { id: p.id, name: p.name };
    });
    const projectIds = Object.keys(projectMap).map(Number);

    if (projectIds.length === 0) {
      return res.json({ actions: [], dueToday: [], stats: { totalActions: 0, doneToday: 0 } });
    }

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // All tasks of these projects
    const projectTasks = await Task.findAll({
      where: { projectId: { [Op.in]: projectIds } },
      attributes: ["id", "name", "deadline", "state", "userId", "projectId"],
      include: [{ model: User, as: "user", attributes: ["id", "fullName", "photo", "status"] }],
    });
    const taskMap = {};
    projectTasks.forEach((t) => {
      taskMap[t.id] = t;
    });
    const taskIds = projectTasks.map((t) => t.id);

    // Recent actions (last 24h)
    const actions = await Action.findAll({
      where: {
        taskId: { [Op.in]: taskIds },
        createdAt: { [Op.gte]: since },
      },
      include: [
        { model: User, attributes: ["id", "fullName", "photo", "status"] },
      ],
      order: [["createdAt", "DESC"]],
      limit: 15,
    });

    const actionsOut = actions.map((a) => {
      const t = taskMap[a.taskId];
      return {
        id: a.id,
        state: a.state,
        createdAt: a.createdAt,
        user: a.user,
        task: t ? { id: t.id, name: t.name } : null,
        project: t ? projectMap[t.projectId] : null,
      };
    });

    // Tasks due today (deadline = today, not Done) — only own tasks
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().slice(0, 10);

    const dueToday = projectTasks
      .filter((t) => t.userId === userId && t.state !== "Done" && t.deadline === todayStr)
      .map((t) => ({
        id: t.id,
        name: t.name,
        state: t.state,
        deadline: t.deadline,
        project: projectMap[t.projectId],
      }));

    // Quick stats
    const doneToday = actions.filter((a) => a.state === "Done").length;

    res.json({
      actions: actionsOut,
      dueToday,
      stats: { totalActions: actions.length, doneToday },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const myActiveTasksCount = async (req, res) => {
  try {
    const count = await Task.count({
      where: {
        userId: req.userId,
        state: { [Op.in]: ["Todo", "Doing"] },
      },
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);
    if (req.userId !== userId) {
      return res.status(403).json({ message: "Forbidden: you can only update your own status" });
    }
    const { status } = req.body;
    const allowed = ["available", "busy", "away"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status. Allowed: available, busy, away" });
    }
    await User.update({ status }, { where: { id: userId } });
    res.json({ message: "Status updated", status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const myData = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    const actionsDone = await Action.count({
      where: {
        userId: req.userId,
        state: 'Done',
      }
    });

    user.setDataValue('tasksDone', actionsDone);
    res.send(user);
  } catch (error) {
    res.status(404).send("error fetching user");
  }
};

const adminDigest = async (req, res) => {
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [newUsers, newProjects, newCommentsCount, recentActions] = await Promise.all([
      User.findAll({
        where: { createdAt: { [Op.gte]: since } },
        attributes: ["id", "fullName", "email", "photo", "role", "createdAt"],
        order: [["createdAt", "DESC"]],
        limit: 20,
      }),
      Project.findAll({
        where: { createdAt: { [Op.gte]: since } },
        attributes: ["id", "name", "createdAt", "managerId"],
        include: [{ model: User, as: "manager", attributes: ["id", "fullName", "photo"] }],
        order: [["createdAt", "DESC"]],
        limit: 20,
      }),
      Comment.count({ where: { createdAt: { [Op.gte]: since } } }),
      Action.findAll({
        where: { createdAt: { [Op.gte]: since } },
        attributes: ["id", "state"],
      }),
    ]);

    const totalActions = recentActions.length;
    const doneCount = recentActions.filter((a) => a.state === "Done").length;

    res.json({
      newUsers,
      newProjects,
      counters: {
        totalActions,
        doneCount,
        newComments: newCommentsCount,
        newUsers: newUsers.length,
        newProjects: newProjects.length,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const adminStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().slice(0, 10);

    const [totalUsers, managers, regularUsers, totalProjects, allProjects, allTasks] = await Promise.all([
      User.count(),
      User.count({ where: { role: "manager" } }),
      User.count({ where: { role: "user" } }),
      Project.count(),
      Project.findAll({ attributes: ["id", "managerId"] }),
      Task.findAll({ attributes: ["id", "state", "deadline", "projectId"] }),
    ]);

    const totalTasks = allTasks.length;
    const activeTasks = allTasks.filter((t) => t.state !== "Done").length;
    const overdueTasks = allTasks.filter(
      (t) => t.state !== "Done" && t.deadline && t.deadline < todayStr
    ).length;

    // Projects without assigned manager (managerId null OR doesn't exist)
    const projectsNoManager = allProjects.filter((p) => !p.managerId).length;

    // Projects with > 5 overdue tasks (problem projects)
    const overdueByProject = {};
    allTasks.forEach((t) => {
      if (t.state !== "Done" && t.deadline && t.deadline < todayStr) {
        overdueByProject[t.projectId] = (overdueByProject[t.projectId] || 0) + 1;
      }
    });
    const problemProjects = Object.entries(overdueByProject).filter(([, n]) => n > 5).length;

    res.json({
      totalUsers,
      managers,
      regularUsers,
      totalProjects,
      totalTasks,
      activeTasks,
      overdueTasks,
      projectsNoManager,
      problemProjects,
      attentionCount: projectsNoManager + problemProjects,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "fullName", "username", "email", "profession", "photo", "role"],
    });
    const projects = await Project.findAll({
      attributes: ["id", "name", "managerId"],
      include: [{ model: User, as: "Users", attributes: ["id"], through: { attributes: [] } }],
    });

    const result = users.map((u) => {
      const userData = u.toJSON();
      if (userData.role === "admin") return userData;

      userData.projectRoles = [];
      for (const proj of projects) {
        const isManager = proj.managerId === u.id;
        const isMember = proj.Users.some((m) => m.id === u.id);
        if (isManager) {
          userData.projectRoles.push({ projectId: proj.id, projectName: proj.name, role: "manager" });
        } else if (isMember) {
          userData.projectRoles.push({ projectId: proj.id, projectName: proj.name, role: "member" });
        }
      }
      return userData;
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const adminResetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "admin") {
      return res.status(403).json({ message: "Cannot reset another admin's password" });
    }
    const hashed = bcrypt.hashSync(newPassword, 8);
    await User.update({ password: hashed }, { where: { id } });
    res.json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!["manager", "user"].includes(role)) {
      return res.status(400).json({ message: "Invalid role. Must be 'manager' or 'user'" });
    }
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.role === "admin") {
      return res.status(403).json({ message: "Cannot change admin role" });
    }
    await User.update({ role }, { where: { id } });
    res.json({ message: "Role updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAchievements = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Batch queries instead of N+1
    const [tasksDone, doneTasks, projectsIn, projectsManaged, commentsCount, userTasks] = await Promise.all([
      // Tasks done count
      Task.count({ where: { userId, state: "Done" } }),
      // Tasks done on time
      Task.findAll({
        where: { userId, state: "Done", deadline: { [Op.ne]: null } },
        attributes: ["deadline", "updatedAt"],
      }),
      // Projects as member (with eager loading of users)
      user.getProjectsIn(),
      // Projects managed (with eager loading of users)
      user.getProjects({ include: [{ model: User, as: "Users", attributes: ["id"] }] }),
      // Comments count
      Comment.count({ where: { userId } }),
      // All user's tasks for project completion calculation
      Task.findAll({
        where: { projectId: { [Op.in]: [] } }, // Will be populated if needed
        attributes: ["projectId", "state"],
      })
    ]);

    // Calculate tasks on time
    const tasksOnTime = doneTasks.filter((t) => {
      const deadline = new Date(t.deadline + "T23:59:59");
      return t.updatedAt <= deadline;
    }).length;

    const projectsCount = projectsIn.length + projectsManaged.length;
    const managedProjects = projectsManaged.length;

    // Calculate manager stats more efficiently
    let maxTeamSize = 0;
    let completedProjects = 0;

    if (projectsManaged.length > 0) {
      // Get all tasks for managed projects in one query
      const projectIds = projectsManaged.map((p) => p.id);
      const projectTasks = await Task.findAll({
        where: { projectId: { [Op.in]: projectIds } },
        attributes: ["projectId", "state"],
      });

      // Count team members from eager-loaded associations
      projectsManaged.forEach((proj) => {
        const memberCount = proj.Users ? proj.Users.length : 0;
        if (memberCount > maxTeamSize) maxTeamSize = memberCount;
      });

      // Calculate completed projects
      projectIds.forEach((projId) => {
        const projTasks = projectTasks.filter((t) => t.projectId === projId);
        const doneTasks = projTasks.filter((t) => t.state === "Done");
        if (projTasks.length > 0 && projTasks.length === doneTasks.length) {
          completedProjects++;
        }
      });
    }

    res.json({
      tasksDone,
      tasksOnTime,
      projectsCount,
      commentsCount,
      managedProjects,
      maxTeamSize,
      completedProjects,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user profile by ID
const getProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);

    // Permission check: user can only see own profile, admin can see any
    if (req.userRole !== "admin" && req.userId !== userId) {
      return res.status(403).json({ message: "Forbidden: You can only view your own profile" });
    }

    const user = await User.findByPk(userId, {
      attributes: ["id", "fullName", "username", "email", "profession", "photo", "role", "status", "createdAt"],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user profile (fullName, profession, email)
const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);
    const { fullName, profession, email } = req.body;

    // Permission check: user can only update own profile, admin can update any
    if (req.userRole !== "admin" && req.userId !== userId) {
      return res.status(403).json({ message: "Forbidden: You can only update your own profile" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prepare update data
    const updateData = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (profession !== undefined) updateData.profession = profession;
    if (email !== undefined) updateData.email = email;

    await User.update(updateData, { where: { id: userId } });

    const updatedUser = await User.findByPk(userId, {
      attributes: ["id", "fullName", "username", "email", "profession", "photo", "role", "status", "createdAt"],
    });

    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ message: "Email already in use" });
    }
    res.status(500).json({ message: error.message });
  }
};

// Update user photo
const updatePhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);

    // Permission check: user can only update own photo, admin can update any
    if (req.userRole !== "admin" && req.userId !== userId) {
      return res.status(403).json({ message: "Forbidden: You can only update your own photo" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!req.files || !req.files.image) {
      return res.status(400).json({ message: "No image file provided" });
    }

    const { image } = req.files;

    // Validate file type
    if (!ALLOWED_MIMETYPES.includes(image.mimetype)) {
      return res.status(400).json({ message: "Invalid file type. Only JPEG, PNG, GIF allowed" });
    }

    // Validate file size
    if (image.size > MAX_FILE_SIZE) {
      return res.status(400).json({ message: "File too large. Max 5MB" });
    }

    // Delete old photo if it's not the default avatar
    const fs = require("fs");
    if (user.photo && user.photo !== "images/users/DefaultAvatar.svg") {
      const oldPhotoPath = path.join(__dirname, "../../storage", user.photo);
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlink(oldPhotoPath, (err) => {
          if (err) console.error("Error deleting old photo:", err);
        });
      }
    }

    // Save new photo
    const imagePath = path.join(__dirname, "../../storage/images/users/");
    const ext = path.extname(image.name) || "." + image.mimetype.split("/")[1];
    const imageName = crypto.randomBytes(16).toString("hex") + ext;
    await image.mv(path.join(imagePath, imageName));

    const photoPath = "images/users/" + imageName;
    await User.update({ photo: photoPath }, { where: { id: userId } });

    res.json({ message: "Photo updated successfully", photoPath });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Change user password
const changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);
    const { oldPassword, newPassword } = req.body;

    // Permission check: users can only change own password, admin cannot change other users' passwords
    if (req.userId !== userId) {
      return res.status(403).json({ message: "Forbidden: You can only change your own password" });
    }

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Old password and new password are required" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify old password
    const isValidPassword = bcrypt.compareSync(oldPassword, user.password);
    if (!isValidPassword) {
      // Generic error message for security (prevent password enumeration)
      return res.status(400).json({ message: "Failed to change password. Please check your old password and try again." });
    }

    // Validate new password
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long" });
    }

    // Hash and save new password
    const hashedPassword = bcrypt.hashSync(newPassword, 8);
    await User.update({ password: hashedPassword }, { where: { id: userId } });

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  signin,
  signup,
  singnup: signup, // backward compatibility alias
  signout,
  myActiveTasksCount,
  myDigest,
  updateStatus,
  userProjects,
  search,
  userProjectsMember,
  userProjectsMemeber: userProjectsMember, // backward compatibility alias
  myData,
  getAllUsers,
  updateUserRole,
  adminResetPassword,
  adminStats,
  adminDigest,
  getAchievements,
  getProfile,
  updateProfile,
  updatePhoto,
  changePassword,
};
