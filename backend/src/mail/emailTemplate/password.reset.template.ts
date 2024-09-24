export const getPasswordResetLinkTemplate = (
  resetLink: string,
): string => {
  return `
    <div style="font-family: Arial, sans-serif; text-align: center; background-color: #f4f4f4; padding: 20px; border-radius: 8px;">
      <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p style="color: #555;">
          We received a request to reset your password. You can reset your password by clicking the link below:
        </p>
        <a href="${resetLink}" style="display: inline-block; margin: 10px 0; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset My Password</a>
        <p style="color: #555;">If you didn't request a password reset, please ignore this email.</p>
        <br>
        <p style="color: #555;">Thank you,</p>
        <p style="color: #333; font-weight: bold;">The ShopSphere Team</p>
      </div>
    </div>
  `;
};
