import { Schema, model, models } from "mongoose";

export type QuestionType = "MCQ" | "THEORY";
export type Difficulty = "Easy" | "Medium" | "Hard";

export interface IQuestion {
  _id?: string;
  type: QuestionType;
  subject: string;
  topic: string;
  difficulty: Difficulty;
  question: string;
  options?: string[];
  correctAnswer?: number | string;
  marks: number;
  explanation?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const questionSchema = new Schema<IQuestion>(
  {
    type: { type: String, enum: ["MCQ", "THEORY"], required: true },
    subject: { type: String, required: true, trim: true },
    topic: { type: String, required: true, trim: true },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], required: true },
    question: { type: String, required: true, trim: true },
    options: [{ type: String }],
    correctAnswer: { type: Schema.Types.Mixed },
    marks: { type: Number, required: true },
    explanation: { type: String },
  },
  { timestamps: true },
);

export const Question = models.Question || model<IQuestion>("Question", questionSchema);
