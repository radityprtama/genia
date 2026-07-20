import { Resend } from "resend";
import { emailConfig } from "./email-config";

let resendInstance: Resend | null = null;

export function getResend(): Resend {
  if (!resendInstance) {
    if (!emailConfig.resendApiKey) {
      throw new Error(
        "RESEND_API_KEY is not set. Email functionality will not work."
      );
    }
    resendInstance = new Resend(emailConfig.resendApiKey);
  }
  return resendInstance;
}
