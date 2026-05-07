const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../../database/index");
const User = require('../user/model');
const Project = require('../project/model');


const Task = sequelize.define('task', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    state: {
        type: DataTypes.STRING,
        allowNull: false
    },
    deadline: {
        type: DataTypes.DATEONLY,
        allowNull: true
    }
})

Task.belongsTo(User);
Task.belongsTo(Project);
User.hasMany(Task)
Project.hasMany(Task);



module.exports = Task