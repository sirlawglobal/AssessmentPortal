import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Question } from "@/models/question";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get("subject");
    const type = searchParams.get("type");

    const query: any = {};
    if (subject && subject !== "All") query.subject = subject;
    if (type && type !== "All") query.type = type;

    const questions = await Question.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ questions });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Failed to fetch questions" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { type, subject, topic, difficulty, question, options, correctAnswer, marks, explanation } = data;

    if (!type || !subject || !topic || !difficulty || !question || marks === undefined) {
      return NextResponse.json(
        { message: "Missing required question fields" },
        { status: 400 }
      );
    }

    if (type === "MCQ" && (!Array.isArray(options) || options.length < 2)) {
      return NextResponse.json(
        { message: "MCQ questions require at least 2 options" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const created = await Question.create({
      type,
      subject,
      topic,
      difficulty,
      question,
      options: type === "MCQ" ? options : [],
      correctAnswer,
      marks: Number(marks),
      explanation,
    });

    return NextResponse.json({ question: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Failed to create question" },
      { status: 500 }
    );
  }
}
