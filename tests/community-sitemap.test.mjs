import test from "node:test";
import assert from "node:assert/strict";
import { moduleUrl } from "./helpers/typescript.mjs";
const site = await moduleUrl("data/site.ts");
const stub = `data:text/javascript,${encodeURIComponent(`
export const communityClient=()=>globalThis.__sitemapDb;
export const indexableProfiles=async ids=>{ globalThis.__sitemapIds=ids; if(globalThis.__sitemapFail)throw Error('offline'); return globalThis.__sitemapEligible; };
`)}`;
const { GET } = await import(await moduleUrl("app/community/profile-sitemaps/[page]/route.ts", { "@/lib/community/server": stub, "@/data/site": site }));
const request = page => GET(new Request("http://localhost/test"), { params: Promise.resolve({ page }) });
test("Profile sitemap uses a bounded candidate page and only shared-gate usernames and stored dates", async () => {
  let range;
  const query = { select: () => query, order: () => query, range: async (...args) => { range=args; return { data:[{id:'eligible'},{id:'empty'},{id:'restricted'}],error:null }; } };
  globalThis.__sitemapDb={from:table=>{assert.equal(table,'community_profiles');return query;}};
  globalThis.__sitemapEligible=[{id:'eligible',username:'creator',updated_at:'2026-09-25T00:00:00Z'}];
  const response=await request('2'); const xml=await response.text();
  assert.deepEqual(range,[200,299]); assert.deepEqual(globalThis.__sitemapIds,['eligible','empty','restricted']);
  assert.match(xml,/<loc>https:\/\/zqtion.com\/u\/creator<\/loc>/);
  assert.match(xml,/<lastmod>2026-09-25T00:00:00.000Z<\/lastmod>/);
  assert.doesNotMatch(xml,/empty|restricted|eligible|@/);
  assert.equal(response.headers.get('cache-control'),'no-store');
});
test("Profile sitemap fails safely and never substitutes unfiltered profiles",async()=>{
  globalThis.__sitemapFail=true;
  assert.equal((await request('0')).status,503);
  globalThis.__sitemapFail=false; globalThis.__sitemapDb=null;
  assert.doesNotMatch(await(await request('0')).text(),/<url>/);
  for(const page of ['-1','abc','1.2','100000'])assert.equal((await request(page)).status,404);
});
