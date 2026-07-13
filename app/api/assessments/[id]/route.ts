import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Assessment } from "@/models/assessment";
import { AssessmentAssignment } from "@/models/assessmentAssignment";
import { Submission } from "@/models/submission";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();

    const deleted = await Assessment.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ message: "Assessment not found" }, { status: 404 });
    }

    // Also remove assignments and submissions associated with this assessment
    await AssessmentAssignment.deleteMany({ assessmentId: id });
    await Submission.deleteMany({ assessmentId: id });

    return NextResponse.json({ message: "Assessment and associated assignments/submissions deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Failed to delete assessment" },
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
    const body = await request.json();
    await connectToDatabase();

    const updated = await Assessment.findByIdAndUpdate(id, body, { new: true });
    if (!updated) {
      return NextResponse.json({ message: "Assessment not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Assessment updated successfully", assessment: updated });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Failed to update assessment" },
      { status: 500 }
    );
  }
}
