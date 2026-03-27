interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  console.log(`[email] To: ${options.to} | Subject: ${options.subject}`);
  // TODO: Integrate with SendGrid/Resend/Nodemailer when ready
}

export const emailTemplates = {
  newMatch(volunteerName: string, orgName: string, oppTitle: string, clientUrl: string) {
    return {
      subject: `New Match on SkillMatch!`,
      html: `
        <h2>You have a new match!</h2>
        <p><strong>${volunteerName}</strong> matched with <strong>${orgName}</strong> for the opportunity: <strong>${oppTitle}</strong>.</p>
        <p><a href="${clientUrl}/app/matches">View your matches</a></p>
      `,
    };
  },
};
