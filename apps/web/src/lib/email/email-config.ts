export const emailConfig = {
  resendApiKey: process.env.RESEND_API_KEY || "",
  fromEmail: process.env.RESEND_FROM_EMAIL || "notifications@genia.tech",
  fromName: "Genia",

  mode: (process.env.EMAIL_MODE || "production") as
    | "development"
    | "production",

  testEmails: {
    delivered: "delivered@resend.dev",
    bounced: "bounced@resend.dev",
    complained: "complained@resend.dev",
  },
} as const;

export function getEmailRecipient(
  userEmail: string,
  testScenario: "delivered" | "bounced" | "complained" = "delivered",
): string {
  if (emailConfig.mode === "development") {
    const testEmail = emailConfig.testEmails[testScenario];
    const [local, domain] = testEmail.split("@");
    const userIdentifier = userEmail.split("@")[0].replace(/[^a-z0-9]/gi, "");
    return `${local}+${userIdentifier}@${domain}`;
  }

  return userEmail;
}

export function isEmailConfigured(): boolean {
  return !!emailConfig.resendApiKey && !!emailConfig.fromEmail;
}

export function getEmailSender() {
  return {
    email: emailConfig.fromEmail,
    name: emailConfig.fromName,
  };
}
