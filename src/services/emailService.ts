import nodemailer from 'nodemailer';

/**
 * ================================
 * CREATE TRANSPORTER (ONCE)
 * ================================
 */
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Verify transporter once at startup
 * (Runs only when server starts)
 */
transporter.verify()
  .then(() => {
    console.log('[EmailService] Transporter is ready');
  })
  .catch((err) => {
    console.error('[EmailService] Transporter verification failed:', err);
  });

/**
 * ================================
 * ASYNC EMAIL SENDER (NON-BLOCKING)
 * ================================
 */
export const sendRegistrationEmailAsync = async (
  to: string,
  registrationData: any,
  retries: number = 2
) => {
  try {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color:#e67e22;">Hare Krishna!</h2>
        <p>
          Thank you for registering <strong>${registrationData.childName}</strong>
          for the <strong>ICVK Program</strong>.
        </p>

        <hr />

        <p><strong>Batch:</strong> ${registrationData.batch}</p>
        <p><strong>Center:</strong> ${registrationData.center}</p>

        <p style="margin-top:20px;">
          We are excited to have your child join us 🙏
        </p>

        <p style="margin-top:30px;">
          Regards,<br />
          <strong>ICVK Team</strong>
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: `"ICVK Team" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'ICVK Registration Confirmation - Hare Krishna!',
      html: htmlContent,
    });

    console.log('[EmailService] Email sent successfully to:', to);

  } catch (error) {
    console.error('[EmailService] Email send failed:', error);

    // 🔁 Retry logic
    if (retries > 0) {
      console.log(`[EmailService] Retrying email... Attempts left: ${retries}`);
      setTimeout(() => {
        sendRegistrationEmailAsync(to, registrationData, retries - 1);
      }, 2000);
    }
  }
};
