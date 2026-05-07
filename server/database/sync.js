const sequelize = require("./");
const User = require("../modules/user/model");
const Project = require("../modules/project/model");
const Task = require("../modules/task/model");
const Action = require("../modules/action/model");
const Comment = require("../modules/comment/model");

(async () => {
  await sequelize.sync({ force: true });
})();
