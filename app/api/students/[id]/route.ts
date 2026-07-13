import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { hashPassword } from "@/lib/auth";
import { User } from "@/models/user";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const user = await User.findById(id).select("-password");
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Failed to fetch user" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { fullName, username, email, phoneNumber, role, password, isDisabled } = await request.json();

    await connectToDatabase();
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Check unique username/email conflict if changed
    if (username && username.trim() !== user.username) {
      const existingUser = await User.findOne({ username: username.trim(), _id: { $ne: id } });
      if (existingUser) {
        return NextResponse.json({ message: "Username already taken by another user" }, { status: 409 });
      }
      user.username = username.trim();
    }

    if (email && email.trim() !== user.email) {
      const existingEmail = await User.findOne({ email: email.trim(), _id: { $ne: id } });
      if (existingEmail) {
        return NextResponse.json({ message: "Email already registered to another user" }, { status: 409 });
      }
      user.email = email.trim();
    }

    if (fullName) user.fullName = fullName.trim();
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber ? phoneNumber.trim() : "";
    if (role && ["ADMIN", "STUDENT"].includes(role)) user.role = role;
    if (isDisabled !== undefined) user.isDisabled = Boolean(isDisabled);

    if (password && password.trim() !== "") {
      user.password = await hashPassword(password.trim());
    }

    await user.save();
    const userObj = user.toObject();
    delete userObj.password;

    return NextResponse.json({ message: "User updated successfully", user: userObj });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Failed to delete user" },
      { status: 500 }
    );
  }
}
