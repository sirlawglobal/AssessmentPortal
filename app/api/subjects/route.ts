import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Subject } from "@/models/subject";

export async function GET() {
  try {
    await connectToDatabase();
    const subjects = await Subject.find().sort({ name: 1 });
    return NextResponse.json({ subjects });
  } catch (error: any) {
    return NextResponse.json({ message: error?.message || "Failed to fetch subjects" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, description } = await request.json();
    if (!name?.trim()) {
      return NextResponse.json({ message: "Subject name is required" }, { status: 400 });
    }

    await connectToDatabase();
    const existing = await Subject.findOne({ name: name.trim() });
    if (existing) {
      return NextResponse.json({ message: "Subject already exists" }, { status: 409 });
    }

    const subject = await Subject.create({ name: name.trim(), description });
    return NextResponse.json({ subject }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error?.message || "Failed to create subject" }, { status: 500 });
  }
}
