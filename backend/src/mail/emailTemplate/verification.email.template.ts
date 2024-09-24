export const getEmailVerificationTemplate = (
  verificationLink: string,
): string => {
  return `
    <div style="font-family: Arial, sans-serif; text-align: center; background-color: #f4f4f4; padding: 20px; border-radius: 8px;">
      <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #333;">Email Verification</h2>

        <p style="color: #555;">
          Thank you for registering with us! To complete your registration, please verify your email address by clicking the link below:
        </p>
        <a href="${verificationLink}" role="button" style="display: inline-block; margin: 10px 0; padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px;">Verify My Email</a>
        <p style="color: #555;">If you did not create an account, please ignore this email.</p>
        <br>
        <p style="color: #555;">Thank you,</p>
        <p style="color: #333; font-weight: bold;">The ShopSphere Team</p>
      </div>
    </div>
  `;
};
