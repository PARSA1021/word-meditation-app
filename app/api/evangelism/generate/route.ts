import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateScript } from "@/features/evangelism/services/evangelism.service";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs"; // Edge doesn't support Prisma out of the box in next.js standard
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  // Authentication check (basic check)
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { type, topic, title } = await req.json();

    if (!type || !title) {
      return NextResponse.json({ error: "Missing type or title" }, { status: 400 });
    }

    // 1. Fetch a random word from the DB
    // If a topic is provided, try to find a word containing that topic in text or category.
    // Otherwise, just get a random word.
    let word = null;
    if (topic && topic.trim() !== "") {
      const matchingWords = await prisma.words.findMany({
        where: {
          OR: [
            { text: { contains: topic } },
            { category: { contains: topic } }
          ]
        },
        take: 50
      });
      if (matchingWords.length > 0) {
        word = matchingWords[Math.floor(Math.random() * matchingWords.length)];
      }
    }

    if (!word) {
      const totalWords = await prisma.words.count();
      const skip = Math.floor(Math.random() * totalWords);
      const randomWords = await prisma.words.findMany({ skip, take: 1 });
      word = randomWords[0];
    }

    if (!word) {
      return NextResponse.json({ error: "No words available in the database" }, { status: 500 });
    }

    // 2. Construct the prompt
    let typeDescription = "";
    switch (type) {
      case "SERMON": typeDescription = "3문단 분량의 감동적인 전도 설교를 작성해 주세요."; break;
      case "MEDITATION": typeDescription = "마음에 평안을 주는 짧은 묵상 글을 작성해 주세요."; break;
      case "PRAYER": typeDescription = "위로와 소망을 주는 짧은 기도문을 작성해 주세요."; break;
      default: typeDescription = "감동적인 전도 스크립트를 작성해 주세요.";
    }

    const prompt = `
카테고리: ${word.category}
말씀: "${word.text}"
출처/스피커: ${word.speaker || word.source || "알 수 없음"}

위의 참부모님/천일국 말씀을 바탕으로 ${typeDescription}
대상은 신앙에 관심이 있는 사람이나 초신자입니다. 어조는 따뜻하고 희망적이며 현대적인 한국어(존댓말)로 작성해 주세요.
${topic ? `특별히 '${topic}'이라는 주제를 강조해 주세요.` : ""}
`;

    // 3. Generate script using OpenAI
    const content = await generateScript(prompt);
    
    // 4. Save to DB
    const script = await prisma.evangelismScript.create({
      data: {
        title,
        content,
        type,
        // authorId: session?.user?.id,
      },
    });
    
    return NextResponse.json({ success: true, data: script });
  } catch (error: any) {
    console.error("Generate Script Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
