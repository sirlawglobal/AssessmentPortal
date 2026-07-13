import { NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth";

export async function POST(request: Request) {
  const { usernameOrEmail, password } = await request.json();

  if (!usernameOrEmail || !password) {
    return NextResponse.json({ message: "Missing credentials" }, { status: 400 });
  }

  const user = await authenticateUser(usernameOrEmail, password);

  if (!user) {
    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
  }

  return NextResponse.json({ user });
}
