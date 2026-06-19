import { NextResponse } from 'next/server';
import { createDonation } from '@/lib/donations';

export async function POST(request: Request) {
  try {
    const { name, memo, amount } = await request.json();
    
    if (!name || amount == null) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const donation = await createDonation({ name, memo: memo || '', amount });

    // Send Slack notification if SLACK_WEBHOOK_URL is set
    const slackUrl = process.env.SLACK_WEBHOOK_URL;
    if (slackUrl) {
      try {
        const slackPayload = {
          text: `새로운 정성 봉헌: ${name}님 (${amount.toLocaleString()}원)`,
          blocks: [
            {
              type: "header",
              text: {
                type: "plain_text",
                text: "✨ 새로운 정성 봉헌이 접수되었습니다",
                emoji: true
              }
            },
            {
              type: "section",
              fields: [
                {
                  type: "mrkdwn",
                  text: `*👤 봉헌인:*\n${name} 님`
                },
                {
                  type: "mrkdwn",
                  text: `*💰 정성 금액:*\n*${amount.toLocaleString()}원*`
                }
              ]
            },
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `*📝 심정의 한마디:*\n> ${memo ? `_${memo}_` : '작성된 내용이 없습니다.'}`
              }
            },
            {
              type: "context",
              elements: [
                {
                  "type": "mrkdwn",
                  "text": `🕒 접수 일시: ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}`
                }
              ]
            },
            {
              type: "divider"
            },
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: "이 봉헌 내역을 확인하고 승인/반려 처리를 진행해 주세요."
              },
              accessory: {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "관리자 대시보드 열기",
                  emoji: true
                },
                value: "admin_dashboard",
                url: "https://word-meditation-app.vercel.app/admin/donations",
                action_id: "button-action",
                style: "primary"
              }
            }
          ]
        };

        await fetch(slackUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(slackPayload),
        });
      } catch (slackError) {
        console.error('Failed to send Slack notification:', slackError);
      }
    }

    return NextResponse.json(donation, { status: 201 });
  } catch (error) {
    console.error('Donation POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
