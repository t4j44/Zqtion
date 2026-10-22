# Google sign-in setup for Zqtion Community

Checked against the official Supabase documentation on 22 October 2026. **Configuration must be performed manually by the environment owner. No hosted settings were changed by this implementation.**

## The two redirects

1. **Google → Supabase:** Google sends its authorization result to `https://<SUPABASE_PROJECT_REF>.supabase.co/auth/v1/callback`. Copy the exact callback from that project's Google provider page; use a configured custom Auth domain instead only if one already exists.
2. **Supabase → Zqtion:** the browser client requests `<CURRENT_APP_ORIGIN>/community/account?next=<ENCODED_INTERNAL_PATH>&intent=<ACTION>&auth=1`. Supabase returns the browser session in the URL fragment. The existing supabase-js client consumes it, persists the session and removes the token fragment. The app then validates the destination and returns there.

This app explicitly retains **implicit browser Auth**, `detectSessionInUrl`, persistent sessions and automatic token refresh. There is no server code-exchange callback and no new `@supabase/ssr` client. Do not paste a PKCE `exchangeCodeForSession` callback into this architecture. A PKCE migration is a separate, complete Auth change.

## Prepare separate environments

Use separate staging and production Supabase projects and Google Web OAuth clients. Test with staging first. Keep production client secrets out of Preview environment variables and local test fixtures.

Record the actual staging/Preview hostname from Vercel's deployment details; this document does not provision or verify one. Prefer a stable branch-preview hostname for OAuth testing. A newly generated Preview hostname must be explicitly registered before testing. Do not allow all `*.vercel.app` tenants.

## Google Auth Platform / Google Cloud Console

For each environment:

1. Select the intended Google Cloud project and open **Google Auth Platform**.
2. Under **Branding**, set the app name (Zqtion Community), support/developer email, approved logo if available, public homepage, privacy policy and terms URLs. Complete domain/brand verification when Google requires it. Existing Zqtion policy URLs are `https://zqtion.com/privacy` and `https://zqtion.com/terms`.
3. Under **Audience**, choose the intended audience. For public sign-in this is an External app. While the app is in Testing, add the Google accounts that will perform acceptance tests. Move to production publishing only after the owner's review; a Testing app is not a generally available production login.
4. Under **Data Access**, configure only basic identity scopes: `openid`, `email`, `profile`. Google's UI may display email/profile as `.../auth/userinfo.email` and `.../auth/userinfo.profile`. Do not add Drive, Gmail, Contacts or other API permissions.
5. Under **Clients**, create an OAuth client of type **Web application**.
6. Add **Authorized JavaScript origins** as origins only, without paths or query strings:
   - Production client: `https://zqtion.com` (add `https://www.zqtion.com` only if it actually serves the app).
   - Staging client: `https://<ACTUAL_STABLE_PREVIEW_HOST>.vercel.app` or the owner's existing staging domain.
   - Staging/local testing only: `http://localhost:3219`. If testing another loopback origin, explicitly configure that exact origin too and verify Google's validation rules. Keep one hostname consistent throughout a test.
7. Add the **Authorized redirect URI** copied from the intended Supabase project's Google provider page: `https://<STAGING_OR_PRODUCTION_REF>.supabase.co/auth/v1/callback`. This is not the Zqtion account page.
8. Store the client ID and client secret securely. Enter them in the matching **Supabase Google provider** configuration. Never put the secret in a `NEXT_PUBLIC_*` variable, repository, screenshot, chat or browser code. The app needs no Google secret or separate Google SDK.

## Supabase Auth

Manually open the matching project, confirm its identity, then:

1. Under **Authentication → Sign In / Providers → Google**, enter that environment's Web client ID and secret and enable Google when the owner is ready. Keep nonce and other security checks enabled; this integration needs no security bypass.
2. Under **URL Configuration**, use the correct environment's Site URL. Production's expected origin is `https://zqtion.com`; staging's is its actual stable hostname. A mismatched Site URL can silently send sign-ins to the wrong environment.
3. Add the exact app callback to **Redirect URLs**, plus the tightly scoped query variant because this application retains the return path and intent in the query:

   ```text
   https://zqtion.com/community/account
   https://zqtion.com/community/account\?**
   ```

   In the staging project, replace the production origin with the exact Preview/staging origin. For local testing against a staging provider, add:

   ```text
   http://localhost:3219/community/account
   http://localhost:3219/community/account\?**
   ```

   The single backslash escapes the literal `?` in Supabase's glob syntax. `**` permits variable query values after that exact callback path; it does not wildcard the origin or the callback pathname. If entering these through JSON, escape the backslash as `\\`. Include the literal callback entry as well and verify the complete query-bearing redirect in the real provider test. Avoid blanket production `/**` and global Vercel wildcard allowlists.
4. Preserve existing email/password, confirmation and recovery settings. Check that email templates use the supplied redirect destination correctly. Do not add a PKCE-only token-hash endpoint to the current implicit email links.
5. Keep Google email verification separate from Community profile completion and LinkedIn identity. Google users have no additional password requirement. Profile creation still occurs deliberately through the existing user-ID keyed write RPC; no Google-name/email based profile matching is added. Supabase owns Auth identity linking. Test an existing verified email/password account signing in with Google; if identities do not link as intended, investigate provider configuration instead of merging/deleting application profiles manually.

## Vercel environment checks

The existing public browser configuration is `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and the existing `NEXT_PUBLIC_COMMUNITY_ENABLED` gate. Confirm Preview uses the staging project and Production uses the production project. Keep privileged Supabase credentials server-only. Do not expose the Google client secret through Vercel public variables.

The callback uses the current browser origin, not an untrusted `next` origin or an assumed deployment URL. No production deployment, feature-flag change or application activation is part of this implementation. If a configuration variable needs rebuilding, the owner should schedule an approved staging build before any production promotion.

## Manual acceptance checklist

Use real Google test accounts and the configured staging provider. Local simulated tests alone do not establish success here.

- Open the exact registered Preview origin. Browse the feed, discussions, comments, search and public profiles while signed out. Confirm private/draft/hidden content is absent.
- Click **Continue with Google**. Check the consent screen branding and that only basic identity scopes appear. Complete sign-in. With no destination, return to `/ai-experiences`.
- With a new Google account, confirm public browsing works without a password or Community profile. Attempt a reply: verify the exact post query and composer target survive authentication. Complete required LinkedIn/profile/guidelines once, then return to the same conversation with no automatic posting.
- Repeat with an existing Google user and an existing verified email/password user's Google identity. Confirm the saved profile is reused and no duplicate profile is created.
- Try signed-out Save and Upvote. Confirm return to the same post, and confirm the action is still pending until deliberately clicked.
- Cancel Google consent, retry with email, test invalid/external return URLs, refresh a signed-in tab, expire/revoke a test session, sign out and switch accounts. Confirm no stale moderator/profile state remains.
- Verify email account creation/confirmation, existing email login, and a real password-reset email. Recovery must stay on the new-password form rather than redirecting away.
- Test phone/desktop, both themes, keyboard focus and announcements. Inspect the final address bar for leftover Auth tokens/errors without copying tokens into reports.
- Recheck two-user RLS, moderation and email privacy on staging. Google login must never grant moderation rights or verify LinkedIn.

Record the tested hostname, source commit, provider project identity (no secrets), test account roles and results. **Real Google OAuth, hosted identity linking, real email delivery and production readiness remain unverified until these manual checks pass.**

## Official references

- [Supabase Google sign-in](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Supabase JavaScript signInWithOAuth](https://supabase.com/docs/reference/javascript/auth-signinwithoauth)
- [Supabase redirect URLs and glob syntax](https://supabase.com/docs/guides/auth/redirect-urls)
- [Google Auth Platform](https://console.cloud.google.com/auth/overview)
- [Supabase changelog](https://supabase.com/changelog)

## Separate decision: optional LinkedIn

Making LinkedIn optional is not included. The current `community_profiles.linkedin_url` NOT NULL/CHECK constraints, profile validation and write RPC, and profile/index eligibility assume it is present. Any change needs a separately reviewed schema and validation plan, migration approval and regression tests. Google verification must not bypass those rules.
