require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fileupload = require("express-fileupload");

const projectRouter = require("./modules/project/route.js");
const taskRouter = require("./modules/task/route.js");
const userRouter = require("./modules/user/route.js");
const commentRouter = require("./modules/comment/route.js");
const actionRouter = require("./modules/action/route.js");

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.static(path.join(__dirname, "/storage")));

app.use(fileupload());
app.use(express.json());

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176,http://localhost:5177,http://localhost:5178")
  .split(",")
  .map((s) => s.trim());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Type'],
    maxAge: 86400, // 24 hours preflight cache
  })
);

app.use("/api/project", projectRouter);
app.use("/api/task", taskRouter);
app.use("/api", userRouter);
app.use("/api", commentRouter);
app.use("/api", actionRouter);

// Centralized error handler
app.use((err, req, res, next) => {
  console.error(err.stack || err);
  const status = err.status || 500;
  res.status(status).json({
    error: true,
    message: err.message || "Internal server error",
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`App listening on port ${PORT} ✅ ✅`);
  });
}

module.exports = app;
