import { DonationRecord } from '@/app/api/donate/manual/route';

/**
 * 후원 알림 전송 (Slack Block Kit)
 */
export async function sendDonationNotification(record: DonationRecord) {
  const { id, donorName, amount, status, message, createdAt, hasDonated } = record;

  // 1. 적절한 웹훅 URL 선택
  const webhookUrl = (
    (status === 'CONFIRMED' ? process.env.SLACK_WEBHOOK_CONFIRMED : process.env.SLACK_WEBHOOK_MESSAGE) ||
    process.env.SLACK_WEBHOOK_URL ||
    process.env.NEXT_PUBLIC_SLACK_WEBHOOK_URL ||
    process.env.WebhookURL
  )?.trim();

  if (!webhookUrl) {
    console.warn('[Slack Notification Skip]: No Webhook URL found.');
    return false;
  }

  // URL 유효성 검사 (설계 원칙 준수)
  if (!webhookUrl.startsWith('https://hooks.slack.com/')) {
    console.error('[Slack Notification Error]: Invalid Webhook URL format.');
    return false;
  }

  const nameDisplay = donorName || '익명 후원자';
  const amountDisplay = amount > 0 ? `${amount.toLocaleString()}원` : '금액 미입력';
  const statusEmoji = hasDonated ? '✅ [송금완료]' : '💌 [메시지만]';
  
  // 시간 포맷
  const formattedTime = new Date(createdAt).toLocaleString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true
  });

  // 2. 슬랙 페이로드 구성 (Block Kit)
  const payload = {
    // 폰 푸시 알림용 미리보기 텍스트
    text: `${statusEmoji} ${nameDisplay} · ${amount > 0 ? amountDisplay : '새 메시지'}`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${statusEmoji} ${nameDisplay}* 님이 마음을 보내주셨습니다. ${amount > 0 ? `(\`${amountDisplay}\`)` : ''}`
        }
      },
      { type: 'divider' },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*🙏 후원자*\n${nameDisplay}` },
          { type: 'mrkdwn', text: `*💰 금액*\n${amountDisplay}` },
          { type: 'mrkdwn', text: `*📌 상태*\n${hasDonated ? '실제 송금 완료' : '메시지만 전송'}` },
          { type: 'mrkdwn', text: `*⏰ 일시*\n${formattedTime}` }
        ]
      },
      { type: 'divider' },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: message ? `💬 *남겨주신 마음*\n> ${message.replace(/\n/g, '\n> ')}` : '_메시지가 없습니다._'
        }
      },
      { type: 'divider' },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: hasDonated 
            ? '📍 *관리자 체크리스트:*\n- [ ] 입금 확인 (은행 앱)\n- [ ] 감사 답장/기도 (필요 시)' 
            : '📍 *관리자 체크리스트:*\n- [ ] 메시지 확인\n- [ ] 추후 입금 시 매칭 확인'
        }
      },
      {
        type: 'context',
        elements: [
          { type: 'mrkdwn', text: `🆔 ID: \`${id}\`` }
        ]
      }
    ]
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Slack API Error (${response.status}):`, errorText);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error sending Slack notification:', error);
    return false;
  }
}
