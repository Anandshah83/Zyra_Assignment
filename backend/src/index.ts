import express from "express";
import cors from "cors";
import { requestIdMiddleware, requestLogger } from "./middleware/logger";
import { errorHandler } from "./middleware/errorHandler";
import studentRoutes from "./routes/students";
import taskRoutes from "./routes/tasks";

const app = express();
const PORT = process.env.PORT || 4000;

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(requestIdMiddleware); // Attach a unique ID to every request (Task 2)
app.use(requestLogger);       // Log every request with that ID  (Task 2)

// --- Routes ---
app.use("/students", studentRoutes);
app.use("/tasks", taskRoutes);

// Health check - handy for making sure the server is alive
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// --- Error handler (must come after routes) ---
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Zyra backend running on http://localhost:${PORT}`);
});

export default app;
