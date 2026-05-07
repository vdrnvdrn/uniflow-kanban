const sequelize = require("./");
const User = require("../modules/user/model");
const Project = require("../modules/project/model");
const Task = require("../modules/task/model");
const Comment = require("../modules/comment/model");

const users = require("../data/users.json");
const projects = require("../data/projects.json");
const tasks = require("../data/tasks.json");
const comments = require("../data/comments.json");

(async () => {
  await (async () => {
    try {
      await User.bulkCreate(users);
      console.log("Users seeded successfully!!");
    } catch (error) {
      console.log("Users seeding Error!!", error);
    }
  })();

  await (async () => {
    try {
      await Project.bulkCreate(projects);
      console.log("Projects seeded successfully!!");
    } catch (error) {
      console.log("Projects seeding Error!!", error);
    }
  })();

  await (async () => {
    try {
      // Add members to projects
      const project1 = await Project.findByPk(1);
      const project2 = await Project.findByPk(2);
      if (project1) await project1.addUsers([2, 3, 4, 6]); // Михаил, Леонид, Мария, Ольга
      if (project2) await project2.addUsers([1, 2, 3, 4, 6]); // Семён, Михаил, Леонид, Мария, Ольга
      console.log("Project members seeded successfully!!");
    } catch (error) {
      console.log("Project members seeding Error!!", error);
    }
  })();

  await (async () => {
    try {
      await Task.bulkCreate(tasks);
      console.log("Tasks seeded successfully!!");
    } catch (error) {
      console.log("Tasks seeding Error!!", error);
    }
  })();

  await (async () => {
    try {
      await Comment.bulkCreate(comments);
      console.log("Comments seeded successfully!!");
    } catch (error) {
      console.log("Comments seeding Error!!", error);
    }
  })();
})();
