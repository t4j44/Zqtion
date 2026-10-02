import "server-only";
import { siteConfig } from "@/data/site";
import { customerConfirmation, internalLeadNotification, type EmailContent, type ProjectBrief } from "./templates";

export type DeliveryResult = {
  status: "accepted" | "unconfigured" | "rejected" | "unknown";
  providerId?: string;
  httpStatus?: number;
};

// Accept one mailbox only; reject lists, display names, mailto parameters and header controls.
export function isSingleMailbox(value: string) {
  return /^[a-z0-9.!#$%&'*+/=^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/i.test(value);
}

async function sendWithResend(content: EmailContent, to: string, replyTo: string, idempotencyKey: string): Promise<DeliveryResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.INQUIRY_FROM_EMAIL || `Zqtion <${siteConfig.email}>`;
  const senderAddress = from.match(/^[^<>\r\n]+<([^<>]+)>$/)?.[1] || from;
  if (!apiKey || !isSingleMailbox(senderAddress) || /[\r\n]/.test(from) || !isSingleMailbox(to) || !isSingleMailbox(replyTo)) {
    return { status: "unconfigured" };
  }
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "Idempotency-Key": idempotencyKey },
      body: JSON.stringify({ from, to: [to], reply_to: replyTo, ...content }),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    // Never log provider bodies: they may contain private data or configuration.
    if (!response.ok) return { status: response.status >= 500 ? "unknown" : "rejected", httpStatus: response.status };
    const result: unknown = await response.json();
    const id = result && typeof result === "object" && "id" in result ? result.id : undefined;
    return typeof id === "string" && /^[a-zA-Z0-9_-]{1,128}$/.test(id)
      ? { status: "accepted", providerId: id }
      : { status: "unknown" };
  } catch {
    // A timeout can occur after acceptance. Do not describe it as a definite non-send.
    return { status: "unknown" };
  }
}

export async function sendInquiryEmails(brief: ProjectBrief, submittedAt: string, inquiryId: string) {
  const companyEmail = siteConfig.email;
  const internalTo = process.env.INQUIRY_TO_EMAIL || companyEmail;
  // Routing is constructed here, never from request body to/from/reply_to fields.
  const results = await Promise.allSettled([
    sendWithResend(internalLeadNotification(brief, submittedAt, inquiryId, companyEmail), internalTo, brief.email, `inquiry/${inquiryId}/internal`),
    sendWithResend(customerConfirmation(brief, companyEmail), brief.email, companyEmail, `inquiry/${inquiryId}/confirmation`),
  ]);
  const result = (entry: PromiseSettledResult<DeliveryResult>): DeliveryResult => entry.status === "fulfilled" ? entry.value : { status: "unknown" };
  return { internal: result(results[0]), confirmation: result(results[1]) };
}
