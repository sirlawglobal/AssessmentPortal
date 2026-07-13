import { Schema, model, models } from "mongoose";

export type SubmissionStatus = "SUBMITTED" | "MARKED" | "RESULT_PUBLISHED";

export interface ISubmissionAnswer {
  questionId: string;
  mcqChoice?: number | string;
  theoryAnswerText?: string;
  theoryFileUrl?: string;
  marksAwarded?: number;
  feedback?: string;
}

export interface ISubmission {
  _id?: string;
  assessmentId: string;
  assignmentId?: string;
  userId: string;
  answers: ISubmissionAnswer[];
  totalScore: number;
  maxScore: number;
  status: SubmissionStatus;
  submittedAt: Date;
  markedAt?: Date;
  markedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const submissionAnswerSchema = new Schema<ISubmissionAnswer>(
  {
    questionId: { type: String, required: true },
    mcqChoice: { type: Schema.Types.Mixed },
    theoryAnswerText: { type: String },
    theoryFileUrl: { type: String },
    marksAwarded: { type: Number, default: 0 },
    feedback: { type: String },
  },
  { _id: false },
);

const submissionSchema = new Schema<ISubmission>(
  {
    assessmentId: { type: String, required: true, index: true },
    assignmentId: { type: String },
    userId: { type: String, required: true, index: true },
    answers: [submissionAnswerSchema],
    totalScore: { type: Number, default: 0 },
    maxScore: { type: Number, required: true },
    status: {
      type: String,
      enum: ["SUBMITTED", "MARKED", "RESULT_PUBLISHED"],
      default: "SUBMITTED",
    },
    submittedAt: { type: Date, default: Date.now },
    markedAt: { type: Date },
    markedBy: { type: String },
  },
  { timestamps: true },
);

export const Submission =
  models.Submission || model<ISubmission>("Submission", submissionSchema);
