import { create } from "zustand";


interface StudentStore {
  selectedStudentId: string;
  setSelectedStudentId: (id: string) => void;
}

export const useStudentStore = create<StudentStore>((set) => ({
  selectedStudentId: "stu_001",
  setSelectedStudentId: (id) => set({ selectedStudentId: id }),
}));
