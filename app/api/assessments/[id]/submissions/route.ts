import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Submission } from "@/models/submission";
import { User } from "@/models/user";
import { AssessmentAssignment } from "@/models/assessmentAssignment";
import { Question } from "@/models/question";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assessmentId } = await params;
    await connectToDatabase();

    const submissions = await Submission.find({ assessmentId }).sort({ submittedAt: -1 }).lean();
    const enriched = await Promise.all(
      submissions.map(async (sub: any) => {
        const student = await User.findById(sub.userId).select("fullName username email profilePicture").lean();
        const answersWithQuestions = await Promise.all(
          (sub.answers || []).map(async (ans: any) => {
            const question = await Question.findById(ans.questionId).select("question type difficulty marks options correctAnswer").lean();
            return {
              ...ans,
              questionDetails: question,
            };
          })
        );
        return {
          ...sub,
          id: sub._id?.toString(),
          student,
          answers: answersWithQuestions,
        };
      })
    );

    return NextResponse.json({ submissions: enriched });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assessmentId } = await params;
    const { submissionId, theoryGrades = [], status = "RESULT_PUBLISHED", markedBy = "admin" } = await request.json();

    if (!submissionId) {
      return NextResponse.json({ message: "Submission ID is required" }, { status: 400 });
    }

    await connectToDatabase();
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return NextResponse.json({ message: "Submission not found" }, { status: 404 });
    }

    let updatedTotal = 0;
    submission.answers = submission.answers.map((ans: any) => {
      const grade = theoryGrades.find((g: any) => g.questionId === ans.questionId);
      if (grade !== undefined) {
        ans.marksAwarded = Number(grade.marksAwarded || 0);
        ans.feedback = grade.feedback || "";
      }
      updatedTotal += Number(ans.marksAwarded || 0);
      return ans;
    });

    submission.totalScore = updatedTotal;
    submission.status = status;
    submission.markedAt = new Date();
    submission.markedBy = markedBy;
    await submission.save();

    if (submission.userId) {
      await AssessmentAssignment.findOneAndUpdate(
        { assessmentId, userId: submission.userId },
        { status: status === "RESULT_PUBLISHED" ? "RESULT_PUBLISHED" : "MARKED" }
      );
    }

    return NextResponse.json({ message: "Grading saved successfully", submission });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Failed to grade submission" },
      { status: 500 }
    );
  }
}
