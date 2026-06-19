// app/api/push/test/route.ts
import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";

export async function POST(req: NextRequest) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT ?? "mailto:admin@example.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );

  try {
    const { subscription } = await req.json();

    if (!subscription?.endpoint) {
      return NextResponse.json(
        { error: "subscription 정보가 없습니다." },
        { status: 400 }
      );
    }

    const payload = JSON.stringify({
      title: "🌿 오늘의 말씀 — 테스트",
      body: "알림이 정상적으로 도착했습니다! 매일 이런 형식으로 말씀이 전달됩니다.",
      icon: "/icons/icon-192x192.png",
      badge: "/icons/badge-96x96.png",
      url: "/today",
    });

    await webpush.sendNotification(subscription as webpush.PushSubscription, payload);

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[push/test] 오류:", message);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}