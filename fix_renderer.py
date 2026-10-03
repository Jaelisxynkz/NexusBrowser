path = r'C:\Users\yassi\OneDrive\Documents\Visual Studio Projects\Nexus Browser\src\components\nexus\NexusShell.tsx'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the desktop block: lines 951-969 (0-indexed: 950-968)
start = None
end = None
for i, l in enumerate(lines):
    if 'if (desktop) {' in l and start is None:
        start = i
    if start is not None and l.strip() == '}' and end is None:
        end = i
        break

print(f"Replacing lines {start+1}-{end+1}")

new_block = '''  // Desktop renders websites in a real <webview> DOM element. Unlike the old
  // native BrowserView (an OS layer that always paints above HTML content,
  // making the shell chrome invisible behind websites), the webview tag
  // participates in the stacking context, so shell UI can sit on top with
  // z-index. The ref is already wired with event listeners above.
  if (desktop) {
    if (!tab || !tab.url) return null;
    const preloadPath = window.nexusDesktop?.pagePreloadPath;
    return (
      <div className="absolute inset-0 h-full w-full bg-[#05070d]">
        <webview
          ref={webviewRef}
          key={frameKey}
          src={tab.url}
          title={tab.title}
          className="h-full w-full border-0"
          data-desktop-webview
          aria-label={`${tab.title} native Chromium page`}
          allowpopups="true"
          partition="persist:nexus-profile"
          preload={preloadPath}
          httpreferrer={tab.url}
        />
        {tab.loading && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-[#05070d]/60">
            <div className="flex flex-col items-center gap-3 text-white/60">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/15 border-t-[#60a5fa]" />
              <div className="text-xs text-white/50">{tab.title || "Loading…"}</div>
            </div>
          </div>
        )}
      </div>
    );
  }
'''

lines[start:end+1] = [new_block]

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Done")
