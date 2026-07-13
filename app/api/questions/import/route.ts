import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Question } from "@/models/question";

function parseCsv(csvString: string) {
  const lines = csvString.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
  const results: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const vals = parseCsvLine(lines[i]);
    if (vals.length < headers.length) continue;

    const row: any = {};
    headers.forEach((h, idx) => {
      row[h] = vals[idx]?.trim() || "";
    });

    results.push(row);
  }

  return results;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' && line[i + 1] === '"') {
      cur += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(cur);
      cur = "";
    } else {
      cur += char;
    }
  }
  result.push(cur);
  return result;
}

export async function POST(request: Request) {
  try {
    const { format, data } = await request.json();
    if (!data) {
      return NextResponse.json({ message: "No import data provided" }, { status: 400 });
    }

    let items: any[] = [];
    if (format === "csv" && typeof data === "string") {
      const rows = parseCsv(data);
      items = rows.map((row) => {
        const type = row.type?.toUpperCase() === "THEORY" ? "THEORY" : "MCQ";
        const options = row.options
          ? row.options.split("|").map((o: string) => o.trim())
          : [];
        let correctAnswer: any = row.correctanswer || row.correct_answer || "";
        if (type === "MCQ" && !isNaN(Number(correctAnswer))) {
          correctAnswer = Number(correctAnswer);
        }

        return {
          type,
          subject: row.subject || "General",
          topic: row.topic || "General",
          difficulty: ["Easy", "Medium", "Hard"].includes(row.difficulty)
            ? row.difficulty
            : "Medium",
          question: row.question || "",
          options: type === "MCQ" ? options : [],
          correctAnswer,
          marks: Number(row.marks) || 1,
          explanation: row.explanation || "",
        };
      });
    } else if (Array.isArray(data)) {
      items = data.map((item: any) => ({
        type: item.type === "THEORY" ? "THEORY" : "MCQ",
        subject: item.subject || "General",
        topic: item.topic || "General",
        difficulty: ["Easy", "Medium", "Hard"].includes(item.difficulty)
          ? item.difficulty
          : "Medium",
        question: item.question || "",
        options: Array.isArray(item.options) ? item.options : [],
        correctAnswer: item.correctAnswer ?? item.correct_answer ?? "",
        marks: Number(item.marks) || 1,
        explanation: item.explanation || "",
      }));
    } else {
      return NextResponse.json({ message: "Unsupported format or data structure" }, { status: 400 });
    }

    const validItems = items.filter((q) => q.question && q.subject && q.topic);
    if (validItems.length === 0) {
      return NextResponse.json({ message: "No valid questions found in import" }, { status: 400 });
    }

    await connectToDatabase();
    const created = await Question.insertMany(validItems);

    return NextResponse.json(
      { message: `Successfully imported ${created.length} questions`, count: created.length, questions: created },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Failed to import questions" },
      { status: 500 }
    );
  }
}
