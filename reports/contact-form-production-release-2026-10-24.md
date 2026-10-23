# Zqtion contact form — production release record

Date: 2026-10-24 (Asia/Dhaka)
Project: t4j44/Zqtion
Production domains: https://zqtion.com and https://www.zqtion.com
Release PR: #2 (merged as `5086f2dc35e620b9353e9595bb16ff5216370533`)

## Positive staging acceptance
- The approved Preview contact form completed a genuine Cloudflare Turnstile challenge.
- A real test inquiry was persisted in the **staging**, not production, Supabase `website_inquiries` table at 2026-10-23 21:33:54 UTC.
- The visitor confirmation email was visibly received in Gmail.
- The internal lead notification email was visibly received in Zoho at `info@zqtion.com`.
- Preview Vercel deployment `dpl_cWv1oY4fqP7kq4uojZJT6jhsjQtR` was Ready and its GitHub deployment check succeeded.
- Source includes tests for credential isolation. Preview-only `_2` aliases are not enabled in Production.

## Production controls checked
- Production `website_inquiries` has row-level security enabled.
- The persistent inquiry rate-limit function permits service-role execution but not anonymous execution.
- Vercel Production has the proper `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `SUPABASE_SECRET_KEY`, and `SUPABASE_URL` variables. Secret contents are not recorded here.
- Production `NEXT_PUBLIC_INQUIRY_FALLBACK_ENABLED` was updated to `false` after the PR merge.
- This release-record commit intentionally triggers a new build so the public Next.js form reads the updated Production setting.

## Post-release verification
- Confirm the new Production deployment is Ready and resolves on both main domains.
- Check that `/contact` shows the full form and valid Cloudflare widget rather than the fallback.
- Run one controlled Production inquiry with an authorized test mailbox; verify a Production Supabase row, internal notification at `info@zqtion.com`, and visitor confirmation receipt.
- Investigate failures in Vercel inquiry logs and Resend; do not repeatedly submit an ambiguous request.
- If a customer-facing failure occurs, immediately restore `NEXT_PUBLIC_INQUIRY_FALLBACK_ENABLED=true` and build again, or roll back to the previously healthy Production deployment.

Note: successful staging acceptance does not by itself prove production delivery or guarantee future delivery. Do not claim production smoke checks passed before observing them.
