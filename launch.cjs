const { exec } = require("child_process");
const path = require("path");

const exe = path.resolve(__dirname, "node_modules", "electron", "dist", "electron.exe");
// Run directly (not via start) so cmd.exe's cleared env is inherited
const cmd = `set "ELECTRON_RUN_AS_NODE=" && set "NEXUS_DEV_URL=http://127.0.0.1:5173" && "${exe}" .`;

const child = exec(cmd, { cwd: __dirname, windowsHide: true }, (err) => {
  if (err && !err.killed) console.error("Exit:", err.message);
});
// Detach: don't let this script hold the browser open
child.unref();
console.log("Electron launched via exec");