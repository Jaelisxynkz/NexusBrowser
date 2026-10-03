@echo off
cd /d "C:\Users\yassi\OneDrive\Documents\Visual Studio Projects\Nexus Browser"
set ELECTRON_RUN_AS_NODE=1
start "NEXUS" node scripts/launch-electron.mjs .