import { Router, Request, Response, NextFunction } from "express";
import { tasks } from "../data/mockData";
import { AppError } from "../middleware/errorHandler";

const router = Router();

// "completed" matches the official mock data — not "done"
const VALID_STATUSES = ["todo", "in_progress", "completed"] as const;
const STATUS_ALIASES = { done: "completed" } as const;
type TaskStatus = (typeof VALID_STATUSES)[number];

type RawStatus = TaskStatus | keyof typeof STATUS_ALIASES;

// PATCH /tasks/:taskId/status
// Lets the counselor update a task's status directly from the action center.
router.patch(
  "/:taskId/status",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const { taskId } = req.params;
      const rawStatus = (req.body as { status?: string }).status;
      const aliasStatus = STATUS_ALIASES[rawStatus as keyof typeof STATUS_ALIASES];
      const status = (aliasStatus ?? rawStatus) as string;

      if (!status || !VALID_STATUSES.includes(status as TaskStatus)) {
        throw new AppError(
          `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
          400
        );
      }

      const validStatus = status as TaskStatus;
      const taskIndex = tasks.findIndex((t) => t.id === taskId);
      if (taskIndex === -1) {
        throw new AppError(`Task with id "${taskId}" not found`, 404);
      }

      // Update in memory — would be a db.tasks.updateOne() in production
      tasks[taskIndex].status = validStatus;
      tasks[taskIndex].updatedAt = new Date().toISOString();

      res.json({
        message: "Task status updated",
        task: tasks[taskIndex],
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
