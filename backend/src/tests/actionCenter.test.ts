import { describe, it, expect, beforeAll } from "vitest";
import supertest from "supertest";
import app from "../index";

// Integration tests — these hit real Express routes with no mocking.
// Using the official Zyra mock data IDs (tsk_001 etc).

const request = supertest(app);

describe("GET /students/:id/action-center", () => {
  it("returns full action center data for a valid student", async () => {
    const res = await request.get("/students/stu_001/action-center");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("student");
    expect(res.body).toHaveProperty("tasks");
    expect(res.body).toHaveProperty("unreadMessages");
    expect(res.body).toHaveProperty("urgencyLevel");
    expect(res.body.student.id).toBe("stu_001");
    expect(Array.isArray(res.body.tasks)).toBe(true);
  });

  it("only returns tasks that belong to the requested student", async () => {
    const res = await request.get("/students/stu_001/action-center");

    expect(res.status).toBe(200);
    res.body.tasks.forEach((task: { studentId: string }) => {
      expect(task.studentId).toBe("stu_001");
    });
  });

  it("correctly counts unread messages for the student", async () => {
    const res = await request.get("/students/stu_001/action-center");

    // stu_001 has msg_001 and msg_002 unread (msg_003 is read)
    expect(res.status).toBe(200);
    expect(res.body.unreadMessages).toBe(2);
  });

  it("returns 404 for a student ID that does not exist", async () => {
    const res = await request.get("/students/stu_999/action-center");

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error");
  });

  it("attaches a request ID header to every response", async () => {
    const res = await request.get("/students/stu_001/action-center");

    expect(res.headers).toHaveProperty("x-request-id");
    expect(typeof res.headers["x-request-id"]).toBe("string");
  });
});

describe("PATCH /tasks/:taskId/status", () => {
  it("updates a task status to completed successfully", async () => {
    const res = await request
      .patch("/tasks/tsk_001/status")
      .send({ status: "completed" });

    expect(res.status).toBe(200);
    expect(res.body.task.status).toBe("completed");
    expect(res.body.task.id).toBe("tsk_001");
  });

  it("updates a task status to in_progress", async () => {
    const res = await request
      .patch("/tasks/tsk_009/status")
      .send({ status: "in_progress" });

    expect(res.status).toBe(200);
    expect(res.body.task.status).toBe("in_progress");
  });

  it("accepts the legacy done status as completed", async () => {
    const res = await request
      .patch("/tasks/tsk_001/status")
      .send({ status: "done" });

    expect(res.status).toBe(200);
    expect(res.body.task.status).toBe("completed");
  });

  it("returns 400 when status field is missing from the body", async () => {
    const res = await request
      .patch("/tasks/tsk_001/status")
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("returns 404 when the task does not exist", async () => {
    const res = await request
      .patch("/tasks/tsk_999/status")
      .send({ status: "completed" });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error");
  });
});
