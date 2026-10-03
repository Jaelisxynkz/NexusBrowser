const fs = require('fs');
const p = 'src/components/nexus/NexusShell.tsx';
let c = fs.readFileSync(p, 'utf8');

// Fix handleNavigate to handle nexus:// URLs specially
const oldHandleNavigate = `  const handleNavigate = useCallback(
    (input: string) => {
      if (!input.trim()) return;
      if (activeTab) navigateTab(activeTab.id, input);
      else openTab(input);
      setView("web");
    },
    [activeTab],
  );`;

const newHandleNavigate = `  const handleNavigate = useCallback(
    (input: string) => {
      if (!input.trim()) return;
      // Handle internal nexus:// URLs specially - don't normalize them
      if (input.startsWith("nexus://")) {
        const url = input;
        if (activeTab) {
          const tabs = allTabs();
          const next = tabs.map((t) => {
            if (t.id !== activeTab.id) return t;
            const trimmed = t.history.slice(0, t.histIdx + 1);
            const newHistory = [...trimmed, url];
            return {
              ...t,
              url,
              title: url === "nexus://premium" ? "Nexus Premium" : url === "nexus://vpn" ? "NexusVPN" : url === "nexus://diagnostics" ? "Diagnostics" : domainOf(url),
              favicon: undefined,
              history: newHistory,
              histIdx: newHistory.length - 1,
              loading: false,
              suspended: false,
              lastActiveAt: Date.now(),
            };
          });
          write(K.tabs, next);
        } else {
          openTab(url);
        }
        setView("web");
        return;
      }
      if (activeTab) navigateTab(activeTab.id, input);
      else openTab(input);
      setView("web");
    },
    [activeTab],
  );`;

if (c.includes(oldHandleNavigate)) {
  c = c.replace(oldHandleNavigate, newHandleNavigate);
  console.log('Fixed handleNavigate');
} else {
  console.log('Could not find handleNavigate pattern');
}

fs.writeFileSync(p, c, 'utf8');
