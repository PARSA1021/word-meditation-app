import { NextResponse } from "next/server";
export const runtime = 'nodejs';
import { allWords } from "@/lib/words-server";

const ddeutgilWords = allWords.filter(w => w.type === "Cheon Il Guk_ddeutgil");

export async function GET() {
  try {
    if (ddeutgilWords.length === 0) {
      return NextResponse.json({ error: "No words found" }, { status: 404 });
    }
    const word = ddeutgilWords[Math.floor(Math.random() * ddeutgilWords.length)];
    return NextResponse.json(word);
  } catch (error) {
    console.error("Daily Word API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
