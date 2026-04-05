const { spawn, execSync } = require("node:child_process");

// Run migrations before starting the server
try {
  console.log("Running database migrations...");
  execSync("npx prisma migrate deploy", { stdio: "inherit" });
  console.log("Migrations complete.");
} catch (err) {
  console.error("Migration failed:", err.message);
  process.exit(1);
}

const port = process.env.PORT || "3000";
const nextBin = require.resolve("next/dist/bin/next");

const child = spawn(process.execPath, [nextBin, "start", "-H", "0.0.0.0", "-p", port], {
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
