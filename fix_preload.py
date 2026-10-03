path = r'C:\Users\yassi\OneDrive\Documents\Visual Studio Projects\Nexus Browser\electron\preload.cjs'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix duplicate setPageBounds
content = content.replace(
    '   setPageBounds: (bounds) => ipcRenderer.send("nexus:page-bounds", bounds),\n   setPageBounds: (bounds) => ipcRenderer.send("nexus:page-bounds", bounds),',
    '  setPageBounds: (bounds) => ipcRenderer.send("nexus:page-bounds", bounds),'
)

# Fix duplicate pageCommand - keep the new one that dispatches CustomEvent
content = content.replace(
    '   // Expose the page preload path so the renderer can use it in the <webview> tag.\n   pagePreloadPath: path.join(__dirname, "page-preload.cjs"),\n   pageCommand: (command) => {\n     try { window.dispatchEvent(new CustomEvent("nexus:web-command", { detail: command })); } catch { /* ignore */ }\n   },\n  pageCommand: (command) => ipcRenderer.send("nexus:page-command", command),',
    '  // Expose the page preload path so the renderer can use it in the <webview> tag.\n  pagePreloadPath: path.join(__dirname, "page-preload.cjs"),\n  // pageCommand dispatches directly on window since the webview lives in the renderer.\n  pageCommand: (command) => {\n    try { window.dispatchEvent(new CustomEvent("nexus:web-command", { detail: command })); } catch { /* ignore */ }\n  },'
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed preload.cjs")
