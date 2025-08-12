import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY);

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

export async function sendOtpEmail(email: string, otp: string): Promise<boolean> {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <img src="https://chef-overseas.com/logo.png" alt="Chef Overseas" style="height: 50px;" />
        <h1 style="color: #ff6b35; margin: 20px 0;">Chef Overseas</h1>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 8px; text-align: center;">
        <h2 style="color: #333; margin-bottom: 20px;">Your Login Code</h2>
        <p style="color: #666; font-size: 16px; margin-bottom: 30px;">
          Use this code to sign in to your Chef Overseas account:
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; border: 2px solid #ff6b35; display: inline-block;">
          <span style="font-size: 32px; font-weight: bold; color: #ff6b35; letter-spacing: 8px;">${otp}</span>
        </div>
        
        <p style="color: #999; font-size: 14px; margin-top: 30px;">
          This code will expire in 10 minutes. If you didn't request this code, please ignore this email.
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
        <p>Chef Overseas - Document Management System</p>
      </div>
    </div>
  `;

  const textContent = `
    Chef Overseas - Login Code
    
    Use this code to sign in to your account: ${otp}
    
    This code will expire in 10 minutes.
    If you didn't request this code, please ignore this email.
    
    Chef Overseas - Document Management System
  `;

  return await sendEmail({
    to: email,
    from: 'noreply@chef-overseas.com', // You may need to verify this domain with SendGrid
    subject: 'Your Chef Overseas Login Code',
    text: textContent,
    html: htmlContent,
  });
}