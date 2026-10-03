const { spawn } = require("child_process");
const path = require("path");

const electronPath = path.resolve(__dirname, "node_modules", "electron", "dist", "electron.exe");
const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;
env.NEXUS_DEV_URL = "http://127.0.0.1:5173";

const child = spawn(electronPath, ["."], {
  cwd: __dirname,
  env,
  detached: true,
  stdio: "ignore",
  windowsHide: false,
});

child.unref();
console.log(JSON.stringify({ pid: child.pid }));

// Exit immediately so the tool doesn't time out — child survives via detach
process.exit(0);