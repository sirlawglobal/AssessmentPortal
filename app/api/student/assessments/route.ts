import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { AssessmentAssignment } from "@/models/assessmentAssignment";
import { Assessment } from "@/models/assessment";
import { Submission } from "@/models/submission";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ message: "userId parameter required" }, { status: 400 });
    }

    await connectToDatabase();
    const assignments = await AssessmentAssignment.find({ userId }).sort({ assignedAt: -1, createdAt: -1 }).lean();

    const enriched = await Promise.all(
      assignments.map(async (assign: any) => {
        const assessment = await Assessment.findById(assign.assessmentId).lean();
        const submission = await Submission.findOne({ assessmentId: assign.assessmentId, userId }).lean();
        return {
          ...assign,
          id: assign._id?.toString(),
          assessment: assessment ? {
            ...assessment,
            id: assessment._id?.toString(),
          } : null,
          submission: submission ? {
            ...submission,
            id: submission._id?.toString(),
          } : null,
        };
      })
    );

    return NextResponse.json({ assignments: enriched.filter((a) => a.assessment !== null) });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Failed to fetch student assessments" },
      { status: 500 }
    );
  }
}
