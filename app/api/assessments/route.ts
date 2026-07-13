import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Assessment } from "@/models/assessment";
import { AssessmentAssignment } from "@/models/assessmentAssignment";

export async function GET() {
  try {
    await connectToDatabase();
    const assessments = await Assessment.find().sort({ createdAt: -1 }).lean();

    const enriched = await Promise.all(
      assessments.map(async (a: any) => {
        const assignmentCount = await AssessmentAssignment.countDocuments({
          assessmentId: a._id?.toString(),
        });
        return {
          ...a,
          id: a._id?.toString(),
          assignmentCount,
        };
      })
    );

    return NextResponse.json({ assessments: enriched });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Failed to fetch assessments" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const {
      title,
      subject,
      assessmentType = "FORMAL",
      description,
      duration,
      passingScore,
      status = "PUBLISHED",
      maxAttempts = 1,
      theoryEnabled = false,
      resultReleaseMode = "IMMEDIATE",
      showCorrectAnswers = true,
      showScoreImmediately = true,
      questionIds = [],
    } = data;

    if (!title || !subject || duration === undefined || passingScore === undefined) {
      return NextResponse.json(
        { message: "Title, subject, duration, and passing score are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const assessment = await Assessment.create({
      title: title.trim(),
      subject: subject.trim(),
      assessmentType,
      description,
      duration: Number(duration),
      passingScore: Number(passingScore),
      status,
      maxAttempts: Number(maxAttempts),
      theoryEnabled: Boolean(theoryEnabled),
      resultReleaseMode,
      showCorrectAnswers: Boolean(showCorrectAnswers),
      showScoreImmediately: Boolean(showScoreImmediately),
      questionIds,
      questionCount: Array.isArray(questionIds) ? questionIds.length : 0,
    });

    return NextResponse.json({ assessment }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Failed to create assessment" },
      { status: 500 }
    );
  }
}
