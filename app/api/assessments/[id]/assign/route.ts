import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { AssessmentAssignment } from "@/models/assessmentAssignment";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assessmentId } = await params;
    const { userIds, assignedBy = "admin" } = await request.json();

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { message: "Provide an array of userIds to assign" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const results = [];
    for (const userId of userIds) {
      const assignment = await AssessmentAssignment.findOneAndUpdate(
        { assessmentId, userId },
        {
          $setOnInsert: {
            assessmentId,
            userId,
            assignedBy,
            status: "ASSIGNED",
          },
        },
        { upsert: true, new: true }
      );
      results.push(assignment);
    }

    return NextResponse.json(
      { message: `Assigned assessment to ${results.length} students`, assignments: results },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Failed to assign assessment" },
      { status: 500 }
    );
  }
}
