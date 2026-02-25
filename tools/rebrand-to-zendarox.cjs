#!/usr/bin/env node
/** Replace ChainNextGen branding with Zendarox across source (not node_modules). */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SKIP = new Set(["node_modules", ".git"]);
const TEXT = new Set([".ts", ".tsx", ".js", ".mjs", ".cjs", ".json", ".md", ".sol", ".bat", ".txt", ".html", ".example"]);

const REPS = [
  ["CHAINNEXTGEN VAULT", "ZENDAROX VAULT"],
  ["ChainNextGen Vault", "Zendarox Vault"],
  ["ChainNextGenVault", "ZendaroxVault"],
  ["ChainNextGen", "Zendarox"],
  ["chainnextgen-vault", "zendarox-vault"],
  ["@chainnextgen/", "@zendarox/"],
  ["chainnextgen.com", "zendarox.com"],
  ["cngVault", "zdrVault"],
  ["npx chainnextgen", "npx zendarox"],
  ["chainnextgen sim", "zendarox sim"],
  ["chainnextgen doctor", "zendarox doctor"],
  ["chainnextgen —", "zendarox —"],
  ['"chainnextgen":', '"zendarox":'],
  ["chainnextgen.js", "zendarox.js"],
  ["chainnextgen.ts", "zendarox.ts"],
  ["(`chainnextgen sim run`)", "(`zendarox sim run`)"],
];

const RENAMES = [
  ["contracts/src/core/ChainNextGenVault.sol", "contracts/src/core/ZendaroxVault.sol"],
  ["contracts/test/ChainNextGenVault.t.sol", "contracts/test/ZendaroxVault.t.sol"],
  ["packages/cli/src/bin/chainnextgen.ts", "packages/cli/src/bin/zendarox.ts"],
];

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (SKIP.has(e.name)) continue;
      if (e.name === "dist") continue;
      walk(path.join(dir, e.name), out);
    } else out.push(path.join(dir, e.name));
  }
  return out;
}

let n = 0;
for (const f of walk(ROOT)) {
  const base = path.basename(f);
  if (base === "rebrand-to-zendarox.cjs" || base === "rebrand-chainnextgen.cjs") continue;
  if (!TEXT.has(path.extname(f).toLowerCase()) && !f.endsWith(".env.example")) continue;
  let t = fs.readFileSync(f, "utf8");
  const o = t;
  for (const [a, b] of REPS) t = t.split(a).join(b);
  if (t !== o) {
    fs.writeFileSync(f, t);
    console.log("  ", path.relative(ROOT, f));
    n++;
  }
}

for (const [from, to] of RENAMES) {
  const src = path.join(ROOT, from);
  const dst = path.join(ROOT, to);
  if (fs.existsSync(src)) {
    fs.renameSync(src, dst);
    console.log("  rename", from, "→", to);
    n++;
  }
}

// Remove stale dist so rebuild is clean
for (const rel of [
  "packages/api/dist",
  "packages/cli/dist",
  "packages/console/dist",
  "packages/shared/dist",
  "packages/simulator/dist",
]) {
  const p = path.join(ROOT, rel);
  if (fs.existsSync(p)) {
    fs.rmSync(p, { recursive: true, force: true });
    console.log("  removed", rel);
  }
}

console.log(`\nRebrand complete — ${n} changes.`);
