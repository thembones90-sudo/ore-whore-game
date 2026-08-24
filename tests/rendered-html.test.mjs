import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the ORE WHORE game shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();

  // Brand / meta
  assert.match(html, /<title>ORE WHORE — Compulsive Geology<\/title>/);
  assert.match(html, /Dig\. Clank\. Crack\. Collect every ore and mineral combination\./);

  // Top nav — primary tabs
  assert.match(html, /<nav aria-label="Primary">/);
  assert.match(html, />MINE</);
  assert.match(html, />ALBUM /);
  assert.match(html, />WANTED</);
  assert.match(html, />RECORDS</);
  assert.match(html, />MORE</);

  // Fresh-save album/dust counters render at zero
  assert.match(html, /0<!-- -->\/225/);
  assert.match(html, /SPECIMEN DUST/);

  // Mine screen — opening copy and biome mastery/card structure
  assert.match(html, /class="mine-screen biome-old/);
  assert.match(html, /KEEP <i>DIGGING\.<\/i>/);
  assert.match(html, /SHIFT 01 · THE LONG WALL/);
  assert.match(html, /aria-label="Mine location"/);
  assert.match(html, /biome-card-old/);
  assert.match(html, /rock depletion-0/);
  assert.match(html, /class="mine-depletion"/);
  assert.match(html, /class="depletion-structure"/);
  assert.match(html, /SURVEY STATE/);
  assert.match(html, /INTACT FACE/);
  assert.match(html, /class="old-mine-stage-art"/);
  assert.match(html, /old-stage-4/);

  // Sequential mine gating: Deep/Outland/Northrend start locked
  assert.match(html, /biome-card-deep\s+locked/);
  assert.match(html, /🔒 DEEP MINE/);
});

test("starter-preview scaffolding stays removed", async () => {
  const response = await render();
  const html = await response.text();

  // The Codex/Sites starter skeleton must not leak into the real game shell.
  assert.doesNotMatch(html, /codex-preview/);
  assert.doesNotMatch(html, /Your site is taking shape/);
  assert.doesNotMatch(html, /react-loading-skeleton/);

  // app/_sites-preview is intentionally emptied (see HANDOFF_FOR_CLAUDE.md) —
  // this guards against the starter skeleton files being reintroduced.
  const previewRoot = new URL("../app/_sites-preview/", import.meta.url);
  await assert.rejects(access(new URL("SkeletonPreview.tsx", previewRoot)));
  await assert.rejects(access(new URL("preview.css", previewRoot)));
});
