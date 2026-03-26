export async function sendSlackNotification(payload: any) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.error('CRITICAL: SLACK_WEBHOOK_URL is not defined in environment variables.');
    throw new Error('Notification system is not configured (Missing Webhook URL)');
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
      throw new Error(`Slack notification failed: ${response.statusText}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error sending Slack notification:', error);
    throw error;
  }
}
