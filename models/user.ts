import mongoose, { Schema, model, models } from "mongoose";

export type UserRole = "ADMIN" | "STUDENT";

export interface IUser {
  _id?: string;
  fullName: string;
  username: string;
  email: string;
  phoneNumber?: string;
  password: string;
  role: UserRole;
  isDisabled?: boolean;
  profilePicture?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    phoneNumber: { type: String, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["ADMIN", "STUDENT"], required: true },
    isDisabled: { type: Boolean, default: false },
    profilePicture: { type: String },
  },
  { timestamps: true },
);

export const User = models.User || model<IUser>("User", userSchema);
