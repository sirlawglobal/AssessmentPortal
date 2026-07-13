import { Schema, model, models } from "mongoose";

export type AssignmentStatus = "ASSIGNED" | "STARTED" | "SUBMITTED" | "MARKED" | "RESULT_PUBLISHED";

export interface IAssessmentAssignment {
  _id?: string;
  assessmentId: string;
  userId: string;
  assignedBy: string;
  assignedAt?: Date;
  status: AssignmentStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

const assessmentAssignmentSchema = new Schema<IAssessmentAssignment>(
  {
    assessmentId: { type: String, required: true },
    userId: { type: String, required: true },
    assignedBy: { type: String, required: true },
    status: { type: String, enum: ["ASSIGNED", "STARTED", "SUBMITTED", "MARKED", "RESULT_PUBLISHED"], default: "ASSIGNED" },
  },
  { timestamps: true },
);

export const AssessmentAssignment = models.AssessmentAssignment || model<IAssessmentAssignment>("AssessmentAssignment", assessmentAssignmentSchema);
