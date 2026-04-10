import { NextRequest, NextResponse } from "next/server";
import { getRandomWordExceptServer } from "@/lib/words-server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const except = searchParams.get("except");
  
  try {
    const exceptIds = except ? except.split(",").map(id => parseInt(id)) : [];
    const word = getRandomWordExceptServer(exceptIds);
    
    if (!word) {
      return NextResponse.json({ error: "No words found" }, { status: 404 });
    }
    
    return NextResponse.json(word);
  } catch (error) {
    console.error("Random Word API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
