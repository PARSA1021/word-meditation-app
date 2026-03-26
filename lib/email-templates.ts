export const getThankYouEmailHtml = (name: string, amount: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { 
      font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
      background-color: #F8F7F4; 
      margin: 0; 
      padding: 0; 
      color: #111827; 
      -webkit-font-smoothing: antialiased;
    }
    .wrapper { 
      padding: 60px 20px; 
      background-color: #F8F7F4; 
    }
    .container { 
      max-width: 540px; 
      margin: 0 auto; 
      background-color: #ffffff; 
      border-radius: 28px; 
      overflow: hidden; 
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01); 
      border: 1px solid rgba(0,0,0,0.03);
    }
    .top-accent {
      height: 6px;
      background: linear-gradient(90deg, #007AFF, #4FB0FF);
    }
    .header { 
      padding: 50px 40px 30px; 
      text-align: left; 
    }
    .badge {
      display: inline-block;
      background-color: rgba(0, 122, 255, 0.1);
      color: #007AFF;
      padding: 6px 14px;
      border-radius: 100px;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.05em;
      margin-bottom: 24px;
    }
    .header h1 { 
      color: #111827; 
      margin: 0; 
      font-size: 26px; 
      font-weight: 800; 
      letter-spacing: -0.02em; 
      line-height: 1.35;
    }
    .content { 
      padding: 0 40px 40px; 
    }
    .content p { 
      font-size: 15px; 
      line-height: 1.8; 
      margin: 0 0 20px 0; 
      color: #616876; 
    }
    .content p:last-of-type {
      margin-bottom: 0;
    }
    .highlight { 
      color: #111827; 
      font-weight: 700; 
    }
    .amount-card { 
      background-color: #F8F9FA; 
      border-radius: 16px; 
      padding: 24px; 
      margin: 36px 0; 
      display: flex;
      justify-content: space-between;
      align-items: center;
      border: 1px solid rgba(0,0,0,0.02);
    }
    .amount-label { 
      font-size: 13px; 
      color: #8B95A1; 
      font-weight: 600; 
      margin-bottom: 4px;
    }
    .amount-value { 
      font-size: 22px; 
      color: #007AFF; 
      font-weight: 800; 
      letter-spacing: -0.01em;
    }
    .team-sign {
      margin-top: 40px;
      font-size: 15px;
      font-weight: 600;
      color: #111827;
    }
    .footer { 
      background-color: #ffffff; 
      padding: 30px 40px; 
      text-align: left; 
      border-top: 1px solid #F3F4F6;
    }
    .footer p {
      color: #A1A1AA; 
      font-size: 13px; 
      margin: 0 0 8px 0;
    }
    .footer p:last-child {
      margin: 0;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="top-accent"></div>
      <div class="header">
        <div class="badge">THANK YOU</div>
        <h1>따뜻한 마음을<br>나누어 주셔서 감사합니다</h1>
      </div>
      <div class="content">
        <p>안녕하세요, <span class="highlight">${name}</span>님.</p>
        <p>TruePath의 말씀 사역을 곁에서 응원해 주시고, 귀한 후원으로 함께해 주셔서 진심으로 감사드립니다.</p>
        <p>보내주신 소중한 마음 덕분에 저희는 더 나은 서비스와 깊이 있는 콘텐츠를 준비하며, 변함없이 안정적인 운영을 이어갈 수 있게 되었습니다.</p>
        
        <div class="amount-card">
          <div>
            <div class="amount-label">후원 금액</div>
            <div class="amount-value">${amount}</div>
          </div>
        </div>
        
        <p>앞으로도 <span class="highlight">${name}</span>님의 일상 속에 TruePath가 작은 평안과 묵상의 기쁨이 되기를 소망합니다.<br>항상 건강하시고 평안한 하루 보내시길 바랍니다.</p>
        
        <div class="team-sign">TruePath 팀 드림</div>
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} TruePath. All rights reserved.</p>
        <p>본 메일은 발신 전용 메일입니다.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;
