const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../../database/index");
const User = require("../user/model");
const Task = require("../task/model");

const Comment = sequelize.define("comment", {
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

Comment.belongsTo(User);
Comment.belongsTo(Task);
User.hasMany(Comment);
Task.hasMany(Comment);

module.exports = Comment;
