export async function sendSlackNotification(payload: any) {
  // 여러 가능성이 있는 환경 변수 이름을 모두 확인합니다.
  const webhookUrl = (
    process.env.SLACK_WEBHOOK_URL || 
    process.env.NEXT_PUBLIC_SLACK_WEBHOOK_URL || 
    process.env.WebhookURL
  )?.trim();
  
  if (!webhookUrl) {
    console.error('CRITICAL: SLACK_WEBHOOK_URL is not defined in environment variables.');
    throw new Error('슬랙 웹훅 URL을 찾을 수 없습니다. (환경변수 설정 확인 필요)');
  }

  if (!webhookUrl.startsWith('https://hooks.slack.com/')) {
    console.error('CRITICAL: SLACK_WEBHOOK_URL is invalid format.');
    throw new Error('슬랙 웹훅 URL 형식이 올바르지 않습니다.');
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Slack API Error (${response.status}):`, errorText);
      throw new Error(`슬랙 API 에러: ${response.statusText}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error sending Slack notification:', error);
    throw error;
  }
}
