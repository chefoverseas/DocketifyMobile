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
      text: params.text || '',
      html: params.html || '',
    });
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

export async function sendOtpEmail(email: string, otp: string): Promise<boolean> {
  // In development mode, log OTP to console for testing
  if (process.env.NODE_ENV === "development") {
    console.log(`\n🔐 OTP CODE FOR ${email}: ${otp}`);
    console.log(`📧 Check server console for OTP code (development mode)\n`);
    return true;
  }

  // Production mode: Send actual email via SendGrid

  // For production, use a verified sender email
  // This needs to be a verified sender in SendGrid
  const fromEmail = 'info@chefoverseas.com'; // Chef Overseas contact email
  
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
}

// Work Permit Status Change Email Notification
export async function sendWorkPermitStatusEmail(email: string, displayName: string, status: string): Promise<boolean> {
  const fromEmail = 'info@chefoverseas.com';
  
  // Status-specific content
  const statusInfo = getStatusEmailContent(status);
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #ff6b35; margin: 20px 0;">Chef Overseas</h1>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 8px;">
        <h2 style="color: #333; margin-bottom: 20px;">Work Permit Status Update</h2>
        <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
          Dear ${displayName},
        </p>
        
        <div style="background: ${statusInfo.bgColor}; padding: 20px; border-radius: 8px; border-left: 4px solid ${statusInfo.borderColor}; margin: 20px 0;">
          <h3 style="color: ${statusInfo.textColor}; margin: 0 0 10px 0;">${statusInfo.title}</h3>
          <p style="color: #666; margin: 0; font-size: 16px;">${statusInfo.message}</p>
        </div>
        
        <div style="margin: 30px 0;">
          <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
            ${statusInfo.description}
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://${process.env.REPLIT_DOMAINS || 'docketify.replit.app'}/workpermit" 
               style="background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              View Work Permit Status
            </a>
          </div>
        </div>
        
        <p style="color: #999; font-size: 14px; margin-top: 30px; text-align: center;">
          If you have any questions, please contact us at info@chefoverseas.com or WhatsApp +919363234028
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
        <p>Chef Overseas - Document Management System</p>
      </div>
    </div>
  `;

  const textContent = `
Chef Overseas - Work Permit Status Update

Dear ${displayName},

${statusInfo.title}
${statusInfo.message}

${statusInfo.description}

View your work permit status: https://${process.env.REPLIT_DOMAINS || 'docketify.replit.app'}/workpermit

If you have any questions, please contact us at info@chefoverseas.com or WhatsApp +919363234028

Chef Overseas - Document Management System
  `;

  try {
    const result = await sendEmail({
      to: email,
      from: fromEmail,
      subject: `Work Permit Status Updated - ${statusInfo.title}`,
      text: textContent,
      html: htmlContent,
    });
    
    console.log(`📧 Work permit status email sent to ${email}: ${status}`);
    return result;
  } catch (error) {
    console.error('Work permit status email error:', error);
    return false;
  }
}

// Final Docket Upload Email Notification
export async function sendFinalDocketUploadEmail(email: string, displayName: string): Promise<boolean> {
  const fromEmail = 'info@chefoverseas.com';
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #ff6b35; margin: 20px 0;">Chef Overseas</h1>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 8px;">
        <h2 style="color: #333; margin-bottom: 20px;">Final Docket Documents Available</h2>
        <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
          Dear ${displayName},
        </p>
        
        <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745; margin: 20px 0;">
          <h3 style="color: #28a745; margin: 0 0 10px 0;">📄 Final Docket Available</h3>
          <p style="color: #666; margin: 0; font-size: 16px;">Your final docket documents have been uploaded and are ready for download.</p>
        </div>
        
        <div style="margin: 30px 0;">
          <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
            Your final docket containing all necessary documents for your work permit application has been prepared and uploaded by our team. You can now download these documents from your dashboard.
          </p>
          
          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
            <p style="color: #856404; margin: 0; font-size: 14px;">
              <strong>Important:</strong> Please review all documents carefully and keep them safe for your application process.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://${process.env.REPLIT_DOMAINS || 'docketify.replit.app'}/workpermit" 
               style="background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Download Final Docket
            </a>
          </div>
        </div>
        
        <p style="color: #999; font-size: 14px; margin-top: 30px; text-align: center;">
          If you have any questions, please contact us at info@chefoverseas.com or WhatsApp +919363234028
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
        <p>Chef Overseas - Document Management System</p>
      </div>
    </div>
  `;

  const textContent = `
Chef Overseas - Final Docket Documents Available

Dear ${displayName},

Final Docket Available
Your final docket documents have been uploaded and are ready for download.

Your final docket containing all necessary documents for your work permit application has been prepared and uploaded by our team. You can now download these documents from your dashboard.

Important: Please review all documents carefully and keep them safe for your application process.

Download your final docket: https://${process.env.REPLIT_DOMAINS || 'docketify.replit.app'}/workpermit

If you have any questions, please contact us at info@chefoverseas.com or WhatsApp +919363234028

Chef Overseas - Document Management System
  `;

  try {
    const result = await sendEmail({
      to: email,
      from: fromEmail,
      subject: 'Final Docket Documents Available - Chef Overseas',
      text: textContent,
      html: htmlContent,
    });
    
    console.log(`📧 Final docket upload email sent to ${email}`);
    return result;
  } catch (error) {
    console.error('Final docket upload email error:', error);
    return false;
  }
}

// Docket Completion Reminder Email
export async function sendDocketReminderEmail(email: string, displayName: string, missingDocuments: string[]): Promise<boolean> {
  // In development mode, log email content to console for testing
  if (process.env.NODE_ENV === "development") {
    console.log(`\n📧 DOCKET REMINDER EMAIL FOR ${email} (${displayName})`);
    console.log(`📋 Missing Documents: ${missingDocuments.join(', ')}`);
    console.log(`📧 Check server console for email content (development mode)\n`);
    return true;
  }

  const fromEmail = 'info@chefoverseas.com';
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #ff6b35; margin: 20px 0;">Chef Overseas</h1>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 8px;">
        <h2 style="color: #333; margin-bottom: 20px;">🔔 Docket Completion Reminder</h2>
        <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
          Dear ${displayName},
        </p>
        
        <div style="background: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
          <h3 style="color: #856404; margin: 0 0 10px 0;">⏰ Action Required</h3>
          <p style="color: #666; margin: 0; font-size: 16px;">Your docket is still incomplete. Please upload the missing documents to proceed with your application.</p>
        </div>
        
        <div style="margin: 30px 0;">
          <h3 style="color: #333; margin-bottom: 15px;">📋 Missing Documents:</h3>
          <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #ddd;">
            <ul style="color: #666; margin: 0; padding-left: 20px;">
              ${missingDocuments.map(doc => `<li style="margin-bottom: 8px;">${doc}</li>`).join('')}
            </ul>
          </div>
          
          <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; border-left: 4px solid #28a745; margin: 20px 0;">
            <p style="color: #155724; margin: 0; font-size: 14px;">
              <strong>💡 Tip:</strong> Make sure all documents are clear, readable, and in PDF, JPG, or PNG format.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://${process.env.REPLIT_DOMAINS || 'docketify.replit.app'}/docket" 
               style="background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Complete Your Docket
            </a>
          </div>
        </div>
        
        <div style="background: #f8d7da; padding: 15px; border-radius: 8px; border-left: 4px solid #dc3545; margin: 20px 0;">
          <p style="color: #721c24; margin: 0; font-size: 14px;">
            <strong>⚠️ Important:</strong> Incomplete dockets may delay your work permit application process. Please complete your docket as soon as possible.
          </p>
        </div>
        
        <p style="color: #999; font-size: 14px; margin-top: 30px; text-align: center;">
          If you have any questions, please contact us at info@chefoverseas.com or WhatsApp +919363234028
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
        <p>Chef Overseas - Document Management System</p>
        <p style="font-size: 12px; color: #999;">You received this email because your docket is incomplete. This reminder will be sent daily until completion.</p>
      </div>
    </div>
  `;

  const textContent = `
Chef Overseas - Docket Completion Reminder

Dear ${displayName},

Action Required: Your docket is still incomplete. Please upload the missing documents to proceed with your application.

Missing Documents:
${missingDocuments.map(doc => `• ${doc}`).join('\n')}

Complete your docket: https://${process.env.REPLIT_DOMAINS || 'docketify.replit.app'}/docket

Important: Incomplete dockets may delay your work permit application process. Please complete your docket as soon as possible.

If you have any questions, please contact us at info@chefoverseas.com or WhatsApp +919363234028

---
Chef Overseas - Document Management System
You received this email because your docket is incomplete. This reminder will be sent daily until completion.
  `;

  try {
    const result = await sendEmail({
      to: email,
      from: fromEmail,
      subject: '🔔 Docket Completion Reminder - Chef Overseas',
      text: textContent,
      html: htmlContent,
    });
    
    console.log(`📧 Docket reminder email sent to ${email}`);
    return result;
  } catch (error) {
    console.error('Docket reminder email error:', error);
    return false;
  }
}

// New User Welcome Email with Overall Status
export async function sendNewUserWelcomeEmail(email: string, displayName: string, uid: string): Promise<boolean> {
  // In development mode, log email content to console for testing
  if (process.env.NODE_ENV === "development") {
    console.log(`\n📧 WELCOME EMAIL FOR ${email} (${displayName})`);
    console.log(`🆔 User ID: ${uid}`);
    console.log(`📧 Check server console for email content (development mode)\n`);
    return true;
  }

  const fromEmail = 'info@chefoverseas.com';
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #ff6b35; margin: 20px 0;">Chef Overseas</h1>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 8px;">
        <h2 style="color: #333; margin-bottom: 20px;">Welcome to Chef Overseas!</h2>
        <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
          Dear ${displayName},
        </p>
        
        <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745; margin: 20px 0;">
          <h3 style="color: #28a745; margin: 0 0 10px 0;">🎉 Account Created Successfully</h3>
          <p style="color: #666; margin: 0; font-size: 16px;">Your account has been created and you can now access our document management system.</p>
        </div>
        
        <div style="margin: 30px 0;">
          <h3 style="color: #333; margin-bottom: 15px;">Your Current Status Overview:</h3>
          
          <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #ddd; margin-bottom: 15px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <span style="font-weight: bold; color: #333;">Account ID:</span>
              <span style="color: #ff6b35; font-weight: bold;">${uid}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <span style="font-weight: bold; color: #333;">Docket Status:</span>
              <span style="color: #ffc107; background: #fff3cd; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Pending Completion</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <span style="font-weight: bold; color: #333;">Work Permit Status:</span>
              <span style="color: #6c757d; background: #e9ecef; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Not Started</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: bold; color: #333;">Account Type:</span>
              <span style="color: #17a2b8; background: #d1ecf1; padding: 4px 8px; border-radius: 4px; font-size: 12px;">User</span>
            </div>
          </div>
          
          <h3 style="color: #333; margin: 25px 0 15px 0;">What's Next?</h3>
          <ul style="color: #666; padding-left: 20px; line-height: 1.6;">
            <li><strong>Complete Your Docket:</strong> Upload all required documents through your dashboard</li>
            <li><strong>Document Review:</strong> Our team will review your submitted documents</li>
            <li><strong>Work Permit Processing:</strong> We'll begin processing your work permit application</li>
            <li><strong>Status Updates:</strong> You'll receive email notifications for all status changes</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://${process.env.REPLIT_DOMAINS || 'docketify.replit.app'}/dashboard" 
               style="background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Access Your Dashboard
            </a>
          </div>
        </div>
        
        <div style="background: #d1ecf1; padding: 15px; border-radius: 8px; border-left: 4px solid #17a2b8; margin: 20px 0;">
          <p style="color: #0c5460; margin: 0; font-size: 14px;">
            <strong>Need Help?</strong> Our support team is here to assist you throughout the process. Contact us at any time.
          </p>
        </div>
        
        <p style="color: #999; font-size: 14px; margin-top: 30px; text-align: center;">
          Contact us: info@chefoverseas.com | WhatsApp: +919363234028
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
        <p>Chef Overseas - Document Management System</p>
      </div>
    </div>
  `;

  const textContent = `
Chef Overseas - Welcome to Your Account

Dear ${displayName},

Account Created Successfully
Your account has been created and you can now access our document management system.

Your Current Status Overview:
- Account ID: ${uid}
- Docket Status: Pending Completion
- Work Permit Status: Not Started
- Account Type: User

What's Next?
1. Complete Your Docket: Upload all required documents through your dashboard
2. Document Review: Our team will review your submitted documents
3. Work Permit Processing: We'll begin processing your work permit application
4. Status Updates: You'll receive email notifications for all status changes

Access your dashboard: https://${process.env.REPLIT_DOMAINS || 'docketify.replit.app'}/dashboard

Need Help? Our support team is here to assist you throughout the process. Contact us at any time.

Contact us: info@chefoverseas.com | WhatsApp: +919363234028

Chef Overseas - Document Management System
  `;

  try {
    const result = await sendEmail({
      to: email,
      from: fromEmail,
      subject: 'Welcome to Chef Overseas - Account Created Successfully',
      text: textContent,
      html: htmlContent,
    });
    
    console.log(`📧 Welcome email sent to new user ${email} (${displayName}, ID: ${uid})`);
    return result;
  } catch (error) {
    console.error('New user welcome email error:', error);
    return false;
  }
}

// Helper function to get status-specific email content
function getStatusEmailContent(status: string) {
  switch (status) {
    case 'approved':
      return {
        title: '✅ Work Permit Approved',
        message: 'Congratulations! Your work permit application has been approved.',
        description: 'Your work permit has been successfully approved. You can now proceed with the next steps in your application process. Please check your dashboard for any additional documents or instructions.',
        bgColor: '#e8f5e8',
        borderColor: '#28a745',
        textColor: '#28a745'
      };
    case 'rejected':
      return {
        title: '❌ Work Permit Rejected',
        message: 'Unfortunately, your work permit application has been rejected.',
        description: 'Your work permit application has been rejected. Please review the feedback and contact our support team for guidance on next steps. You may be able to resubmit with corrections.',
        bgColor: '#f8d7da',
        borderColor: '#dc3545',
        textColor: '#dc3545'
      };
    case 'under_review':
      return {
        title: '📋 Under Review',
        message: 'Your work permit application is currently under review.',
        description: 'Your application is being carefully reviewed by our team. We will notify you as soon as there are any updates. This process may take several business days.',
        bgColor: '#d1ecf1',
        borderColor: '#17a2b8',
        textColor: '#17a2b8'
      };
    case 'preparation':
      return {
        title: '📝 In Preparation',
        message: 'Your work permit application is being prepared.',
        description: 'Our team is currently preparing your work permit application. We are gathering and organizing all necessary documents for submission.',
        bgColor: '#fff3cd',
        borderColor: '#ffc107',
        textColor: '#856404'
      };
    case 'submitted':
      return {
        title: '📤 Application Submitted',
        message: 'Your work permit application has been submitted.',
        description: 'Your application has been successfully submitted to the relevant authorities. We will monitor the progress and keep you updated on any developments.',
        bgColor: '#d4edda',
        borderColor: '#28a745',
        textColor: '#155724'
      };
    default:
      return {
        title: '📄 Status Updated',
        message: 'Your work permit status has been updated.',
        description: 'There has been an update to your work permit application status. Please check your dashboard for the latest information.',
        bgColor: '#e2e3e5',
        borderColor: '#6c757d',
        textColor: '#495057'
      };
  }
}