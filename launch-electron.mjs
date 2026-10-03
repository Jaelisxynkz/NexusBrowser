import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import process from "node:process";

delete process.env.ELECTRON_RUN_AS_NODE;

const require = createRequire(import.meta.url);
const electronBinary = require("electron");

const child = spawn(electronBinary, ["electron/main.cjs"], {
  stdio: "inherit",
  env: process.env,
  windowsHide: false,
  cwd: process.cwd(),
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 0);
});
