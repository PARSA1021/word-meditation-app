import { NextRequest, NextResponse } from "next/server";
import { getWordByIdServer } from "@/lib/words-server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const wordId = parseInt(id);

  try {
    const word = getWordByIdServer(wordId);
    if (!word) {
      return NextResponse.json({ error: "Word not found" }, { status: 404 });
    }
    return NextResponse.json(word);
  } catch (error) {
    console.error("Word Detail API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
