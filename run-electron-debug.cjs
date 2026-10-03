// Debug launcher: spawns Electron WITHOUT ELECTRON_RUN_AS_NODE
delete process.env.ELECTRON_RUN_AS_NODE;
const { spawn } = require("child_process");
const path = require("path");

const electronExe = path.join(__dirname, "..", "node_modules", "electron", "dist", "electron.exe");

const child = spawn(electronExe, ["."], {
  cwd: path.resolve(__dirname, ".."),
  env: process.env,
  windowsHide: false,
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  process.exit(code ?? 0);
});