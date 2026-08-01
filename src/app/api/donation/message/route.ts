import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { donorName, message, amount } = body;

    const slackWebhook = process.env.SLACK_WEBHOOK_URL;
    const discordWebhook = process.env.DISCORD_WEBHOOK_URL;

    const notificationMessage = `*[TruePath 후원 알림]*\n- 후원자: ${donorName}\n- 예정 금액: ${amount || "미정"}\n- 따뜻한 한마디: ${message || "(없음)"}`;

    let sent = false;

    // Send to Slack if configured
    if (slackWebhook) {
      await fetch(slackWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: notificationMessage }),
      }).catch(console.error);
      sent = true;
    }

    // Send to Discord if configured
    if (discordWebhook) {
      await fetch(discordWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: notificationMessage }),
      }).catch(console.error);
      sent = true;
    }

    if (!sent) {
      console.log("No Webhooks configured for donation message:", notificationMessage);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Donation webhook error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
