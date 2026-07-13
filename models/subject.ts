import mongoose, { Schema, model, models } from "mongoose";

export interface ISubject {
  _id?: string;
  name: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const subjectSchema = new Schema<ISubject>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
  },
  { timestamps: true },
);

export const Subject = models.Subject || model<ISubject>("Subject", subjectSchema);
