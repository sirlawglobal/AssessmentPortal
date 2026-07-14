import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Assessment } from "@/models/assessment";
import { Question } from "@/models/question";
import { Submission } from "@/models/submission";
import { AssessmentAssignment } from "@/models/assessmentAssignment";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assessmentId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    await connectToDatabase();
    const assessment = await Assessment.findById(assessmentId).lean();
    if (!assessment) {
      return NextResponse.json({ message: "Assessment not found" }, { status: 404 });
    }

    let submission = null;
    if (userId) {
      submission = await Submission.findOne({ assessmentId, userId }).lean();
    }

    const viewResult = searchParams.get("viewResult") === "true";
    const showExplanations =
      viewResult &&
      submission &&
      (assessment.showCorrectAnswers || assessment.assessmentType === "PRACTICE");

    let questions = [];
    if (assessment.questionIds && assessment.questionIds.length > 0) {
      questions = await Question.find({ _id: { $in: assessment.questionIds } }).lean();
    } else {
      questions = await Question.find({ subject: assessment.subject }).limit(assessment.questionCount || 10).lean();
    }

    const cleanedQuestions = questions.map((q: any) => ({
      id: q._id?.toString(),
      type: q.type,
      subject: q.subject,
      topic: q.topic,
      difficulty: q.difficulty,
      question: q.question,
      options: q.options,
      marks: q.marks,
      ...(showExplanations
        ? {
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
          }
        : {}),
    }));

    return NextResponse.json({
      assessment: { ...assessment, id: assessment._id?.toString() },
      questions: cleanedQuestions,
      submission,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Failed to load assessment details" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assessmentId } = await params;
    const { userId, answers = [] } = await request.json();

    if (!userId) {
      return NextResponse.json({ message: "userId is required to submit" }, { status: 400 });
    }

    await connectToDatabase();
    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return NextResponse.json({ message: "Assessment not found" }, { status: 404 });
    }

    const questions = await Question.find({
      _id: { $in: answers.map((a: any) => a.questionId) },
    }).lean();

    let totalScore = 0;
    let maxScore = 0;

    const processedAnswers = answers.map((ans: any) => {
      const q = questions.find((item: any) => item._id?.toString() === ans.questionId);
      if (!q) {
        return {
          questionId: ans.questionId,
          mcqChoice: ans.mcqChoice,
          theoryAnswerText: ans.theoryAnswerText,
          theoryFileUrl: ans.theoryFileUrl,
          marksAwarded: 0,
        };
      }

      maxScore += Number(q.marks || 0);
      let marksAwarded = 0;

      if (q.type === "MCQ") {
        if (
          ans.mcqChoice !== undefined &&
          ans.mcqChoice !== null &&
          String(ans.mcqChoice).trim() === String(q.correctAnswer).trim()
        ) {
          marksAwarded = Number(q.marks || 0);
        }
      }

      totalScore += marksAwarded;

      return {
        questionId: ans.questionId,
        mcqChoice: ans.mcqChoice,
        theoryAnswerText: ans.theoryAnswerText,
        theoryFileUrl: ans.theoryFileUrl,
        marksAwarded,
      };
    });

    const shouldAutoGrade =
      assessment.assessmentType === "PRACTICE" ||
      !assessment.theoryEnabled ||
      questions.every((q: any) => q.type === "MCQ");

    const finalStatus = shouldAutoGrade ? "GRADED" : "SUBMITTED";

    const existingSub = await Submission.findOne({ assessmentId, userId });
    const nextAttemptNum = existingSub ? (existingSub.attemptNumber || existingSub.attemptsHistory?.length || 1) + 1 : 1;
    const currentAttemptRecord = {
      attemptNumber: nextAttemptNum,
      totalScore,
      maxScore: maxScore || assessment.passingScore * 2 || 100,
      submittedAt: new Date(),
      status: finalStatus,
      answers: processedAnswers,
    };

    let attemptsHistory: any[] = [...(existingSub?.attemptsHistory || [])];
    if (attemptsHistory.length === 0 && existingSub) {
      attemptsHistory.push({
        attemptNumber: 1,
        totalScore: existingSub.totalScore || 0,
        maxScore: existingSub.maxScore || 100,
        submittedAt: existingSub.submittedAt || new Date(),
        status: existingSub.status || "SUBMITTED",
        answers: existingSub.answers || [],
      });
    }
    attemptsHistory.push(currentAttemptRecord);

    const submission = await Submission.findOneAndUpdate(
      { assessmentId, userId },
      {
        $set: {
          assessmentId,
          userId,
          attemptNumber: nextAttemptNum,
          answers: processedAnswers,
          totalScore,
          maxScore: maxScore || assessment.passingScore * 2 || 100,
          status: finalStatus,
          submittedAt: new Date(),
          attemptsHistory,
        },
      },
      { upsert: true, new: true }
    );

    await AssessmentAssignment.findOneAndUpdate(
      { assessmentId, userId },
      { status: finalStatus }
    );

    return NextResponse.json({ message: "Submitted successfully", submission, autoGraded: shouldAutoGrade }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Failed to submit assessment" },
      { status: 500 }
    );
  }
}
