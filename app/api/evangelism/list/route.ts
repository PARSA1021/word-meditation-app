import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = searchParams.get("limit");
  const all = searchParams.get("all") === "true";

  try {
    const scripts = await prisma.evangelismScript.findMany({
      take: limit ? parseInt(limit) : (all ? undefined : 20),
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json({ success: true, data: scripts });
  } catch (error: any) {
    console.error("List Script Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
