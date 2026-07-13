import bcrypt from "bcryptjs";
import { connectToDatabase } from "./mongodb";
import { User } from "../models/user";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hashedPassword: string) {
  return bcrypt.compare(password, hashedPassword);
}

export async function authenticateUser(usernameOrEmail: string, password: string) {
  await connectToDatabase();
  const user = await User.findOne({
    $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
  }).lean();

  if (!user || !user.password) {
    return null;
  }

  const isValid = await comparePassword(password, user.password);
  if (!isValid) {
    return null;
  }

  if (user.isDisabled) {
    return null;
  }

  return {
    id: user._id?.toString(),
    fullName: user.fullName,
    username: user.username,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
    profilePicture: user.profilePicture,
  };
}
