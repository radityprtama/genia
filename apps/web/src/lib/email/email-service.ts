import { getResend } from "./resend";
import { getEmailRecipient, getEmailSender, emailConfig } from "./email-config";
import type { ReactElement } from "react";

export interface SendEmailOptions {
  to: string;
  subject: string;
  react: ReactElement;
  testScenario?: "delivered" | "bounced" | "complained";
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendEmail({
  to,
  subject,
  react,
  testScenario = "delivered",
}: SendEmailOptions): Promise<SendEmailResult> {
  try {
    if (!canSendEmail()) {
      console.warn("RESEND_API_KEY is not set. Email functionality will not work.");
      return { success: false, error: "Email not configured" };
    }

    const resend = getResend();
    const recipient = getEmailRecipient(to, testScenario);
    const sender = getEmailSender();

    if (emailConfig.mode === "development") {
      console.log(
        `[DEV MODE] Sending email to test address: ${recipient} (original: ${to})`
      );
    }

    const { data, error } = await resend.emails.send({
      from: `${sender.name} <${sender.email}>`,
      to: recipient,
      subject,
      react,
    });

    if (error) {
      console.error("Failed to send email:", error);
      return {
        success: false,
        error: error.message || "Failed to send email",
      };
    }

    return {
      success: true,
      messageId: data?.id,
    };
  } catch (error) {
    console.error("Email sending error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export function canSendEmail(): boolean {
  return !!emailConfig.resendApiKey && !!emailConfig.fromEmail;
}
