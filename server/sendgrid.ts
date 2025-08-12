import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY!);

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
  // For now, always use development mode (log OTP to console)
  // This allows testing without SendGrid domain verification issues
  console.log(`\n🔐 OTP CODE FOR ${email}: ${otp}`);
  console.log(`📧 Check server console for OTP code (email sending disabled for development)\n`);
  return true;
  
  // Uncomment below code when SendGrid is properly configured with verified domain
  /*

  // For production, we'll use a verified sender email
  // You need to verify your domain with SendGrid
  const fromEmail = 'noreply@chef-overseas.com'; // This needs to be a verified sender in SendGrid
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
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

  try {
    const result = await sendEmail({
      to: email,
      from: fromEmail,
      subject: 'Your Chef Overseas Login Code',
      text: textContent,
      html: htmlContent,
    });
    
    if (!result) {
      console.error(`Failed to send OTP email to ${email}. Please check SendGrid configuration.`);
    }
    
    return result;
  } catch (error) {
    console.error('SendGrid OTP email error:', error);
    return false;
  }
  */
}