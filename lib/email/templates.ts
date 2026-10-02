export type ProjectBrief = {
  name: string;
  email: string;
  company: string;
  service: string;
  details: string;
  budget: string;
  projectUrl: string;
  landingPath: string;
  referrer: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
};

export type EmailContent = { subject: string; html: string; text: string };

export function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] || character);
}

const firstName = (name: string) => name.trim().split(/\s+/)[0] || "";
const paragraph = (text: string) => `<p style="margin:0 0 20px;color:#dce1e8;font-size:16px;line-height:1.65;">${escapeHtml(text)}</p>`;
const heading = (text: string) => `<h2 style="margin:28px 0 14px;color:#67e8f9;font-size:12px;letter-spacing:2px;">${escapeHtml(text)}</h2>`;

function summary(rows: [string, string][]) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;table-layout:fixed;border:1px solid #343b48;background-color:#151b25;">${rows.map(([label, value]) => `<tr><td style="padding:14px 20px;border-bottom:1px solid #343b48;overflow-wrap:anywhere;word-break:break-word;"><p style="margin:0 0 5px;color:#b4becb;font-size:12px;">${escapeHtml(label)}</p><p style="margin:0;color:#f5f7fa;font-size:15px;line-height:1.6;">${escapeHtml(value)}</p></td></tr>`).join("")}</table>`;
}

function layout(preheader: string, title: string, body: string, replyTo: string, cta: string, companyEmail: string) {
  const mailto = escapeHtml(`mailto:${encodeURIComponent(replyTo)}`);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background-color:#050608;font-family:Arial,Helvetica,sans-serif;color:#f5f7fa;">
<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#050608"><tr><td align="center" style="padding:24px 12px;">
<!--[if mso]><table role="presentation" width="600" align="center"><tr><td><![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#0d1119" style="width:100%;max-width:600px;table-layout:fixed;border:1px solid #343b48;">
<tr><td style="padding:28px 24px;border-bottom:1px solid #343b48;color:#ffffff;font-size:20px;font-weight:bold;letter-spacing:4px;">ZQTION</td></tr>
<tr><td style="padding:32px 24px;overflow-wrap:anywhere;word-break:break-word;"><h1 style="margin:0 0 24px;color:#ffffff;font-size:28px;line-height:1.25;">${escapeHtml(title)}</h1>${body}
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 0;"><tr><td bgcolor="#67e8f9" style="border-radius:6px;"><a href="${mailto}" style="display:inline-block;padding:16px 22px;color:#071018;font-weight:bold;font-size:15px;text-decoration:none;">${escapeHtml(cta)}</a></td></tr></table></td></tr>
<tr><td style="padding:24px;border-top:1px solid #343b48;color:#b4becb;font-size:13px;line-height:1.8;">Zqtion<br>Create. Build. Automate.<br><a href="${escapeHtml(`mailto:${companyEmail}`)}" style="color:#67e8f9;">${escapeHtml(companyEmail)}</a><br><a href="https://www.zqtion.com/" style="color:#dce1e8;">zqtion.com</a></td></tr></table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr></table></body></html>`;
}

export function internalLeadNotification(brief: ProjectBrief, submittedAt: string, inquiryId: string, companyEmail: string): EmailContent {
  const identity: [string, string][] = [
    ["Name", brief.name], ["Email", brief.email], ["Company/project", brief.company || "Not provided"],
    ["Service", brief.service], ["Budget", brief.budget || "Prefer to discuss"], ["Project URL", brief.projectUrl || "Not provided"],
  ];
  const attribution: [string, string][] = [
    ["Landing page", brief.landingPath || "Unknown"], ["Referrer", brief.referrer || "Unknown"],
    ["UTM source", brief.utmSource || "None"], ["UTM medium", brief.utmMedium || "None"],
    ["UTM campaign", brief.utmCampaign || "None"], ["UTM content", brief.utmContent || "None"],
  ];
  const submission: [string, string][] = [["Timestamp (UTC)", submittedAt], ["Inquiry reference", inquiryId]];
  const subject = `New project brief — ${brief.service} — ${brief.name}`.replace(/[\r\n\u0000-\u001f\u007f]/g, " ");
  const textRows = (rows: [string, string][]) => rows.map(([label, value]) => `${label}: ${value}`).join("\n");
  return {
    subject,
    html: layout("A new project brief is ready for review.", "NEW PROJECT BRIEF",
      summary(identity) + heading("PROJECT CONTEXT") + `<p style="color:#dce1e8;font-size:16px;line-height:1.65;">${escapeHtml(brief.details).replace(/\r?\n/g, "<br>")}</p>` + heading("SOURCE / ATTRIBUTION") + summary(attribution) + heading("SUBMISSION") + summary(submission),
      brief.email, firstName(brief.name) ? `Reply to ${firstName(brief.name)}` : "Reply to visitor", companyEmail),
    text: `NEW PROJECT BRIEF\n\n${textRows(identity)}\n\nPROJECT CONTEXT\n${brief.details}\n\nSOURCE / ATTRIBUTION\n${textRows(attribution)}\n\nSUBMISSION\n${textRows(submission)}\n\nReply: mailto:${encodeURIComponent(brief.email)}\n\nZqtion\nCreate. Build. Automate.\n${companyEmail}\nhttps://www.zqtion.com/`,
  };
}

export function customerConfirmation(brief: ProjectBrief, companyEmail: string): EmailContent {
  const name = firstName(brief.name);
  const title = name ? `Thanks, ${name}. Your brief is with us.` : "Thanks. Your brief is with us.";
  const intro = "Thank you for reaching out to Zqtion.";
  const received = "We've received your project brief and will review the context, desired outcome, and any constraints you shared before responding.";
  const next = "Our team reviews the brief before jumping to a solution. If we need additional context, we'll reply to this email. Otherwise, we'll come back with the most useful next step.";
  const reply = "If there's anything you forgot to include, simply reply to this email. It reaches our team directly.";
  const closing = "Thank you for your patience and for considering Zqtion. We appreciate you being here.";
  const rows: [string, string][] = [["Service", brief.service], ["Company/project", brief.company || "Not provided"], ["Budget", brief.budget || "Prefer to discuss"]];
  return {
    subject: "We received your project brief — Zqtion",
    html: layout("Thank you for reaching out. Your brief is now with our team.", title,
      paragraph(intro) + paragraph(received) + heading("WHAT HAPPENS NEXT") + paragraph(next) + heading("YOUR REQUEST") + summary(rows) + heading("KEEP THE CONVERSATION GOING") + paragraph(reply) + paragraph(closing),
      companyEmail, "Reply to Zqtion", companyEmail),
    text: `${title}\n\n${intro}\n\n${received}\n\nWHAT HAPPENS NEXT\n${next}\n\nYOUR REQUEST\n${rows.map(([label, value]) => `${label}: ${value}`).join("\n")}\n\n${reply}\n\n${closing}\n\nZqtion\nCreate. Build. Automate.\n${companyEmail}\nhttps://www.zqtion.com/`,
  };
}
