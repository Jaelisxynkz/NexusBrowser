import re

fp = r"C:\Users\yassi\OneDrive\Documents\Visual Studio Projects\Nexus Browser\src\components\nexus\NexusShell.tsx"
with open(fp, "r", encoding="utf-8") as f:
    content = f.read()

old_cmd = '''    const command = (event: Event) => {
      const detail = (event as CustomEvent<FrameDetail>).detail;
      if (detail.type === "hard-reload") view.reloadIgnoringCache?.();
      if (detail.type === "stop") view.stop?.();
      if (detail.type === "find" && detail.query)
        view.findInPage?.(detail.query, { forward: !detail.backwards, findNext: true });
      if (detail.type === "zoom") {
        const current = view.getZoomLevel?.() ?? 0;
        view.setZoomLevel?.(
          detail.direction === "reset" ? 0 : current + (detail.direction === "in" ? 1 : -1),
        );
      }
      // page-action: dispatch actions to the webview (e.g. from context menu)
      if (detail.type === "page-action" && detail.action) {
        const action = detail.action;
        if (action === "copy") view.addEventListener("did-navigate", () => {}, { once: true });
        // For now, most page actions are handled by the webview's own context menu
        // or by the shell's keyboard shortcuts. This is a placeholder for future use.
      }
    };'''

new_cmd = '''    const command = (event: Event) => {
      const detail = (event as CustomEvent<FrameDetail>)?.detail;
      if (!detail) return;
      // page-action: navigation & history controls
      if (detail.type === "page-action" && detail.action) {
        const a = detail.action;
        if (a === "back") view.goBack?.();
        else if (a === "forward") view.goForward?.();
        else if (a === "reload") view.reloadIgnoringCache?.();
        else if (a === "gohome" && tab?.url) view.src = tab.url;
        else if (a === "navigate" && detail.target) view.src = detail.target;
        else if (a === "copy") { try { view.addEventListener("did-navigate", () => {}, { once: true }); } catch {} }
        return;
      }
      if (detail.type === "hard-reload") view.reloadIgnoringCache?.();
      if (detail.type === "stop") view.stop?.();
      if (detail.type === "find" && detail.query)
        view.findInPage?.(detail.query, { forward: !detail.backwards, findNext: true });
      if (detail.type === "zoom") {
        const current = view.getZoomLevel?.() ?? 0;
        view.setZoomLevel?.(
          detail.direction === "reset" ? 0 : current + (detail.direction === "in" ? 1 : -1),
        );
      }
    };'''

if old_cmd in content:
    content = content.replace(old_cmd, new_cmd)
    with open(fp, "w", encoding="utf-8") as f:
        f.write(content)
    print("Replaced command handler")
else:
    print("OLD NOT FOUND")
    # dump the area around line 798
    lines = content.split("\n")
    for i in range(797, 818):
        print(i+1, repr(lines[i]))
