import type { Teacher } from "./teacher";
export type GymClass = {
  id: number;
  name: string;
  dayOfWeek: number;
  timeStart: string;
  timeEnd: string;
  teacherId: number;
  teacher?: Teacher;
};