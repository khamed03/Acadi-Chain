import { create } from "zustand";

export const useAuth = create((set) => ({
  isAuthed: false,
  role: "guest",          // guest | admin | issuer | student | verifier
  studentId: "",          // used by student
  setAuth: ({ role, studentId }) =>
    set({
      isAuthed: role !== "guest",
      role,
      studentId: studentId || ""
    }),
  logout: () => set({ isAuthed: false, role: "guest", studentId: "" })
}));
