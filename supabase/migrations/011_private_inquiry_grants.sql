-- Deny direct browser and user-token access to private inquiry records.
-- Inquiry processing uses a server-only Supabase service/secret credential.
-- RLS remains enabled, with no anon/authenticated policies.
revoke all privileges on table public.website_inquiries from public, anon, authenticated;
grant select, insert, update, delete on table public.website_inquiries to service_role;
