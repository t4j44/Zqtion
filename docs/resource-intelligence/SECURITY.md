# Security, Hardening & Prompt-Injection Defense

## 1. Untrusted Data Boundary

**Fundamental Rule:** Scraped webpage text, repository READMEs, and community `SKILL.md` files are **untrusted passive data**, never system instructions (Section 42, 43).

### Active Protections:
1. **Sanitization Filter:**
   - Detects and filters prompt-injection markers (`ignore all previous instructions`, `system prompt override`, `send your api keys`).
   - Replaces malicious tokens with `[FILTERED_INJECTION_ATTEMPT]`.
2. **Execution Sandboxing:**
   - The crawler never evaluates JavaScript or shell commands found inside crawled documents.
   - Piped shell instructions (`curl | bash`) are highlighted with security warnings in documentation.

---

## 2. Secrets & Credential Protection

- **No Public Secret Leakage:** Service-role keys, Turnstile secret keys, and database passwords are never exposed in Next.js public client bundles or public APIs.
- **HMAC Rate Limiting:** Rate limiting uses persistent cryptographic hashes of IP addresses with dedicated server-only salts (`RATE_LIMIT_SECRET`).

---

## 3. Database Row Level Security (RLS)

- Public and anonymous users can **only** read resources where `status = 'published'`.
- All writes, modifications, and deletions require authenticated `service_role` authorization.
- The `resource_private` schema is locked down with zero permissions granted to public roles.
