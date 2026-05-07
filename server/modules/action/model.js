const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../../database/index");
const User = require("../user/model");
const Task = require("../task/model");

const Action = sequelize.define("action", {
  state: {
    type: DataTypes.ENUM("Todo", "Doing", "Done"),
    allowNull: false,
  },
});

Action.belongsTo(User);
Action.belongsTo(Task);
User.hasMany(Action);
Task.hasMany(Action);

module.exports = Action;