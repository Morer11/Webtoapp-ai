import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY);

interface EmailParams {
  to: string;
  from?: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    const emailData: any = {
      to: params.to,
      from: params.from || 'noreply@webtoapp.ai',
      subject: params.subject,
    };
    
    if (params.text) emailData.text = params.text;
    if (params.html) emailData.html = params.html;
    
    await mailService.send(emailData);
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

export async function sendVerificationEmail(email: string, code: string): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Email Verification - WebToApp AI</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3B82F6, #1E3A8A); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .code { background: #fff; border: 2px dashed #3B82F6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
            .code-text { font-size: 28px; font-weight: bold; color: #3B82F6; letter-spacing: 4px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Welcome to WebToApp AI!</h1>
                <p>Please verify your email address to complete your registration</p>
            </div>
            <div class="content">
                <p>Hello!</p>
                <p>Thank you for signing up for WebToApp AI. To complete your registration, please enter the verification code below:</p>
                
                <div class="code">
                    <div class="code-text">${code}</div>
                </div>
                
                <p>This code will expire in 15 minutes for security purposes.</p>
                
                <p>If you didn't create an account with us, please ignore this email.</p>
                
                <p>Best regards,<br>The WebToApp AI Team</p>
            </div>
            <div class="footer">
                <p>© 2024 WebToApp AI. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;

  const text = `
    Welcome to WebToApp AI!
    
    Please verify your email address by entering this code: ${code}
    
    This code will expire in 15 minutes.
    
    If you didn't create an account with us, please ignore this email.
    
    Best regards,
    The WebToApp AI Team
  `;

  return sendEmail({
    to: email,
    from: 'noreply@webtoapp.ai',
    subject: 'Verify your email address - WebToApp AI',
    text,
    html,
  });
}

export async function sendPlanUpgradeNotification(userEmail: string, plan: string): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Plan Upgraded - WebToApp AI</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10B981, #047857); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .plan-badge { background: #10B981; color: white; padding: 10px 20px; border-radius: 25px; display: inline-block; font-weight: bold; text-transform: uppercase; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Plan Upgraded Successfully!</h1>
            </div>
            <div class="content">
                <p>Congratulations!</p>
                <p>Your WebToApp AI account has been upgraded to:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <div class="plan-badge">${plan} Plan</div>
                </div>
                
                <p>You now have access to:</p>
                <ul>
                    <li>iOS app generation</li>
                    <li>Desktop app generation</li>
                    <li>Unlimited app conversions</li>
                    <li>Priority support</li>
                    <li>Advanced customization options</li>
                </ul>
                
                <p>Start converting your websites to apps with your new premium features!</p>
                
                <p>Best regards,<br>The WebToApp AI Team</p>
            </div>
            <div class="footer">
                <p>© 2024 WebToApp AI. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: userEmail,
    from: 'noreply@webtoapp.ai',
    subject: `Welcome to ${plan} Plan - WebToApp AI`,
    html,
  });
}
