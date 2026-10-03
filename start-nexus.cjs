const { spawn } = require('child_process');
const path = require('path');
const electron = require('electron');

delete process.env.ELECTRON_RUN_AS_NODE;

const child = spawn(electron, ['electron/main.cjs'], {
  stdio: 'inherit',
  env: process.env,
  windowsHide: false,
  cwd: __dirname,
});

child.on('exit', (code) => process.exit(code || 0));
