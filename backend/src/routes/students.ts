import { Router, Request, Response, NextFunction } from "express";
import { students, tasks, messages } from "../data/mockData";
import { AppError } from "../middleware/errorHandler";

const router = Router();

// GET /students/:id/action-center
// Returns the student profile, their tasks, unread message count,
// and a computed urgency level — everything the counselor needs in one call.
router.get(
  "/:id/action-center",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const student = students.find((s) => s.id === id);
      if (!student) {
        throw new AppError(`Student with id "${id}" not found`, 404);
      }

      const studentTasks = tasks.filter((t) => t.studentId === id);
      const studentMessages = messages.filter((m) => m.studentId === id);
      const unreadCount = studentMessages.filter((m) => !m.read).length;

      // Urgency is computed server-side from open urgent/high priority tasks.
      // at_risk students with any urgent open task are immediately critical.
      const urgencyLevel = computeUrgency(studentTasks, student.enrollmentStatus);

      res.json({
        student,
        tasks: studentTasks,
        unreadMessages: unreadCount,
        urgencyLevel,
      });
    } catch (err) {
      next(err);
    }
  }
);

// Derives urgency from open task priorities and the student's enrollment status.
// "urgent" priority tasks that aren't completed push the level up immediately.
function computeUrgency(
  studentTasks: typeof tasks,
  enrollmentStatus: string
): string {
  const openUrgent = studentTasks.filter(
    (t) => t.priority === "urgent" && t.status !== "completed"
  ).length;

  const openHigh = studentTasks.filter(
    (t) => t.priority === "high" && t.status !== "completed"
  ).length;

  if (openUrgent >= 1) return "critical";
  if (openHigh >= 2) return "high";
  if (enrollmentStatus === "at_risk") return "medium";
  return "low";
}

export default router;
