// import express from "express";
// import authRoutes from "./routes/auth.route.js";
// import messageRoutes from "./routes/message.route.js";
// import dotenv from "dotenv";
// import { connectDB } from "./lib/db.js";
// import cookieParser from "cookie-parser";
// import cors from "cors";
// import { app, server } from "./lib/socket.js";
// import path from "path";

// dotenv.config();

// const PORT = process.env.PORT || 5001;
// const __dirname = path.resolve();

// // Middleware
// app.use(express.json());
// app.use(cookieParser());
// app.use(
//   cors({
//     origin:
//       process.env.NODE_ENV === "development" ? "http://localhost:5173" : "*",
//     credentials: true,
//   })
// );

// // Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/messages", messageRoutes);

// // Serve frontend in production
// if (process.env.NODE_ENV === "production") {
//   // Adjust path relative to backend/src/index.js
//   const frontendDistPath = path.join(__dirname, "../../frontend/dist");

//   app.use(express.static(frontendDistPath));

//   // Send index.html for all other routes (SPA routing)
//   app.get("*", (req, res) => {
//     res.sendFile(path.join(frontendDistPath, "index.html"));
//   });
// }

// // Connect database and start server
// connectDB();
// server.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
import express from "express";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { app, server } from "./lib/socket.js";
import path from "path";
import { fileURLToPath } from "url"; // Required for ESM modules

dotenv.config();

const PORT = process.env.PORT || 5001;

// 1. Get __dirname in an ES module (the reliable way)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); // This points reliably to backend/src

// 2. Determine the path to the project root (up two levels)
const projectRoot = path.join(__dirname, "..", "..");

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "development" ? "http://localhost:5173" : "*",
    credentials: true,
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  // Calculate the path: Project Root + frontend/dist
  const frontendDistPath = path.join(projectRoot, "frontend", "dist");

  app.use(express.static(frontendDistPath)); // Send index.html for all other routes (SPA routing)

  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
}

// Connect database and start server
connectDB();
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
