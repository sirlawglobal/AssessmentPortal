import { Schema, model, models } from "mongoose";

export type AssessmentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type AssessmentType = "FORMAL" | "PRACTICE";
export type QuestionSelectionMode = "FIXED" | "RANDOM";
export type ResultReleaseMode = "IMMEDIATE" | "AFTER_THEORY" | "SCHEDULED" | "MANUAL";
export type ScoringPolicy = "HIGHEST" | "FIRST_ATTEMPT" | "LAST_ATTEMPT" | "AVERAGE";

export interface IAssessment {
  _id?: string;
  title: string;
  subject: string;
  assessmentType: AssessmentType;
  description?: string;
  duration: number;
  passingScore: number;
  startDate?: Date;
  endDate?: Date;
  instructions?: string;
  status: AssessmentStatus;
  maxAttempts: number;
  questionSelection: QuestionSelectionMode;
  theoryEnabled: boolean;
  resultReleaseMode: ResultReleaseMode;
  showCorrectAnswers: boolean;
  showScoreImmediately: boolean;
  questionIds?: string[];
  questionCount?: number;
  difficultyDistribution?: { easy: number; medium: number; hard: number };
  scoringPolicy?: ScoringPolicy;
  createdAt?: Date;
  updatedAt?: Date;
}

const assessmentSchema = new Schema<IAssessment>(
  {
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    assessmentType: { type: String, enum: ["FORMAL", "PRACTICE"], required: true },
    description: { type: String, trim: true },
    duration: { type: Number, required: true },
    passingScore: { type: Number, required: true },
    startDate: { type: Date },
    endDate: { type: Date },
    instructions: { type: String, trim: true },
    status: { type: String, enum: ["DRAFT", "PUBLISHED", "ARCHIVED"], default: "DRAFT" },
    maxAttempts: { type: Number, default: 1 },
    questionSelection: { type: String, enum: ["FIXED", "RANDOM"], default: "FIXED" },
    theoryEnabled: { type: Boolean, default: false },
    resultReleaseMode: { type: String, enum: ["IMMEDIATE", "AFTER_THEORY", "SCHEDULED", "MANUAL"], default: "MANUAL" },
    showCorrectAnswers: { type: Boolean, default: false },
    showScoreImmediately: { type: Boolean, default: false },
    questionIds: [{ type: Schema.Types.ObjectId, ref: "Question" }],
    questionCount: { type: Number },
    difficultyDistribution: {
      easy: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      hard: { type: Number, default: 0 },
    },
    scoringPolicy: { type: String, enum: ["HIGHEST", "FIRST_ATTEMPT", "LAST_ATTEMPT", "AVERAGE"], default: "HIGHEST" },
  },
  { timestamps: true },
);

export const Assessment = models.Assessment || model<IAssessment>("Assessment", assessmentSchema);
