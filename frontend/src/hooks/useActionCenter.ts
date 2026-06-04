import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchActionCenter, updateTaskStatus } from "./api";
import type { TaskStatus } from "../types";


export function useActionCenter(studentId: string) {
  return useQuery({
    queryKey: ["actionCenter", studentId],
    queryFn: () => fetchActionCenter(studentId),
    staleTime: 30_000, // treat data as fresh for 30 seconds
    retry: 2,
  });
}


export function useUpdateTaskStatus(studentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) =>
      updateTaskStatus(taskId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["actionCenter", studentId] });
    },
  });
}
