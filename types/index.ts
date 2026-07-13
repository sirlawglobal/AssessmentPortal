export type Role = "ADMIN" | "STUDENT";

export interface StudentProfile {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phoneNumber?: string;
  profilePicture?: string;
  role: Role;
}

export interface DashboardSummary {
  students: number;
  subjects: number;
  questions: number;
  assessments: number;
  pendingTheoryMarking: number;
  publishedResults: number;
}
