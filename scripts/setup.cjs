const { spawnSync } = require("node:child_process")
const windows = process.platform === "win32"
function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit", shell: windows })
  if (result.status !== 0) process.exit(result.status || 1)
}
run("node", ["scripts/setup-local.cjs"])
run("docker", ["compose", "up", "-d", "--wait"])
for (const args of [
  ["exec", "prisma", "generate"],
  ["exec", "prisma", "migrate", "deploy"],
  ["exec", "medusa", "db:migrate"],
  ["exec", "medusa", "exec", "./src/scripts/seed-content.ts"],
  ["exec", "medusa", "exec", "./src/scripts/expand-store.ts"],
  ["exec", "medusa", "exec", "./src/scripts/create-local-admin.ts"],
])
  run("pnpm", ["--filter", "@dtc/backend", ...args])
console.log(
  "Ready. Start with pnpm dev. Local admin credentials: .local/admin.json"
)
