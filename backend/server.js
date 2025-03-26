import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import itemRouter from "./routes/item.router.js";
import { authRouter } from "./routes/auth.router.js";
import { userRouter } from "./routes/user.router.js";
import { authMiddleware } from "./middleware/authMiddleware.js";
import { messageRouter } from "./routes/message.router.js";

// ✅ Load environment variables from project root
const envLoaded = dotenv.config({ path: "../.env" });

if (envLoaded.error) {
  console.error("❌ ERROR: .env file not found. Make sure you have a .env file in the project root.");
  process.exit(1);
}

console.log("JWT_SECRET Loaded:", process.env.JWT_SECRET ? "✅ Exists" : "❌ MISSING");

if (!process.env.JWT_SECRET) {
  console.error("❌ ERROR: Missing JWT_SECRET in environment variables.");
  process.exit(1);
}

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173","http://localhost:5174"],
    credentials: true,
  })
);

// ✅ Connect to MongoDB
connectDB()
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  });

// ✅ API Routes
app.use("/api/items", itemRouter);
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/uploads", express.static("uploads"));
app.use("/api/messages", messageRouter);


// ✅ Protected Route Example
app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({ msg: "Access granted to protected route!", user: req.user });
});

// ✅ Default Route
app.get("/", (req, res) => {
  res.send("🔗 Welcome to VandyLostAndFound API");
});

// ✅ Global Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// ✅ Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
