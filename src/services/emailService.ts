import nodemailer from 'nodemailer';

export const sendRegistrationEmailAsync = async (
    to: string, 
    registrationData: any, 
    retries: number = 3
): Promise<boolean> => {
    try {
        console.log('[EmailService] Starting email send to:', to);
        
        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
                <div style="background-color: #FBB201; padding: 20px; text-align: center;">
                    <h1 style="color: #2D0A0A; margin: 0;">Hare Krishna!</h1>
                    <p style="color: #2D0A0A; margin: 5px 0 0;">ICVK Registration Confirmed</p>
                </div>
                <div style="padding: 20px; background-color: #FFF9F0;">
                    <p>Dear Parent,</p>
                    <p>Thank you for registering <strong>${registrationData.childName}</strong> for the Indian Culture & Values for Kids (ICVK) program.</p>
                    
                    <div style="background-color: #fff; padding: 15px; border-radius: 8px; border: 1px solid #eee; margin: 20px 0;">
                        <h3 style="color: #ea580c; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 0;">Registration Details</h3>
                        <p><strong>Batch:</strong> ${registrationData.batch}</p>
                        <p><strong>Center:</strong> ${registrationData.center}</p>
                        <p><strong>Parent's Name:</strong> ${registrationData.fatherName} / ${registrationData.motherName}</p>
                    </div>

                    <p>We are excited to have your child join us in this journey of learning and fun!</p>

                    <p style="margin-top: 30px;">
                        Hare Krishna,<br>
                        You have successfully registered for ICVK program, for further queries or information you may please contact <strong>+91 96008 15108</strong>.
                    </p>
                </div>
                <div style="background-color: #2D0A0A; color: #FBB201; padding: 15px; text-align: center; font-size: 12px;">
                    &copy; ${new Date().getFullYear()} Hare Krishna Movement. All rights reserved.
                </div>
            </div>
        `;

        await transporter.sendMail({
            from: `"ICVK Team" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: 'ICVK Registration Confirmation - Hare Krishna!',
            html: htmlContent
        });

        console.log(`[EmailService] ✅ Email sent successfully to ${to}`);
        return true;
    } catch (error: any) {
        console.error(`[EmailService] ❌ Error sending email (${retries} retries left):`, error.message);
        
        // Retry logic
        if (retries > 0) {
            console.log(`[EmailService] 🔁 Retrying in 2 seconds... (${retries} attempts remaining)`);
            await new Promise(resolve => setTimeout(resolve, 5000));
            return sendRegistrationEmailAsync(to, registrationData, retries - 1);
        }
        
        console.error('[EmailService] ❌ All retry attempts failed');
        return false;
    }
};
