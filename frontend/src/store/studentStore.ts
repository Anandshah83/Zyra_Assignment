import { create } from "zustand";

// Simple store that tracks which student the counselor is currently viewing.
// Zustand keeps this lightweight - no boilerplate, no reducers, just a slice of state.
interface StudentStore {
  selectedStudentId: string;
  setSelectedStudentId: (id: string) => void;
}

export const useStudentStore = create<StudentStore>((set) => ({
  selectedStudentId: "stu_001",
  setSelectedStudentId: (id) => set({ selectedStudentId: id }),
}));
