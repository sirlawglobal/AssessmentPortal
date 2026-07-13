import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { hashPassword } from "@/lib/auth";
import { User } from "@/models/user";

export async function GET() {
  try {
    await connectToDatabase();
    const students = await User.find({})
      .select("-password")
      .sort({ createdAt: -1 });
    return NextResponse.json({ students });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { fullName, username, email, phoneNumber, password, role = "STUDENT", profilePicture } =
      await request.json();

    if (!fullName || !username || !email || !password) {
      return NextResponse.json(
        { message: "Full name, username, email, and password are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const existing = await User.findOne({
      $or: [{ username: username.trim() }, { email: email.trim() }],
    });

    if (existing) {
      return NextResponse.json(
        { message: "Username or email already in use" },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const student = await User.create({
      fullName: fullName.trim(),
      username: username.trim(),
      email: email.trim(),
      phoneNumber: phoneNumber?.trim(),
      password: hashedPassword,
      role: ["ADMIN", "STUDENT"].includes(role) ? role : "STUDENT",
      profilePicture,
    });

    const studentObj = student.toObject();
    delete studentObj.password;

    return NextResponse.json({ student: studentObj }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Failed to create student" },
      { status: 500 }
    );
  }
}
