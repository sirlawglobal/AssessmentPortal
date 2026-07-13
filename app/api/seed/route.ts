import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { hashPassword } from "@/lib/auth";
import { User } from "@/models/user";
import { Subject } from "@/models/subject";

export async function GET() {
  await connectToDatabase();

  const adminExists = await User.findOne({ role: "ADMIN" });
  if (!adminExists) {
    await User.create({
      fullName: "Admin User",
      username: "admin",
      email: "admin@stemcenter.com",
      phoneNumber: "07000000000",
      password: await hashPassword("Password123!"),
      role: "ADMIN",
    });
  }

  const studentExists = await User.findOne({ role: "STUDENT" });
  if (!studentExists) {
    await User.create({
      fullName: "Demo Student",
      username: "student",
      email: "student@stemcenter.com",
      phoneNumber: "08000000000",
      password: await hashPassword("Password123!"),
      role: "STUDENT",
    });
  }

  const subjects = ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Further Mathematics"];
  for (const name of subjects) {
    await Subject.findOneAndUpdate(
      { name },
      { $setOnInsert: { name } },
      { upsert: true, new: true },
    );
  }

  return NextResponse.json({ message: "Seeded" });
}
