import { spawnSync } from "node:child_process";

const result = spawnSync(
  process.execPath,
  ["node_modules/next/dist/bin/next", "build", "--webpack"],
  {
    env: { ...process.env, ANALYZE: "true" },
    stdio: "inherit",
  },
);

process.exit(result.status ?? 1);
