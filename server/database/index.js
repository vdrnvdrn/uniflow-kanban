const Sequelize = require("sequelize");
const path = require("path");
const {database,password,host,username,dialect}=require("config")

let sequelize;
if (dialect === "sqlite") {
  const storage = require("config").get("storage");
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: path.resolve(__dirname, "..", storage),
  });
} else {
  sequelize = new Sequelize(database, username, password, {
    host,
    dialect,
  });
}

sequelize
  .authenticate()
  .then(() => console.log("Connection has been established successfully. ✅"))
  .catch((error) =>
    console.error("Unable to connect to the database ❌:", error)
  );
module.exports = sequelize;
