// Context-based reconstruction of lost bytes in NexusShell.tsx.
import fs from "node:fs";

const FILE = "src/components/nexus/NexusShell.tsx";
let t = fs.readFileSync(FILE, "utf8");

const rules = [
  ["\u0001\u001d", "\u2014"],                    // prose em dash
  ["\u0001\"", "\u2019"],                        // "n't" apostrophes
  ["Hi there! \u0001x\u00189", "Hi there! \u{1F44B}"],
  ["中\u0001\u0013!", "中文"],
  ["ا\u0001\u001eعرب\u0001`ة", "العربية"],
  ["ا\u0001\u001eعرب\u0001ة", "العربية"],
  ["Ctrl / \u0001R\u0001 + ", "Ctrl / \u2318 + "],
  ["Alt + \u0001 \u0018", "Alt + \u2190"],
  ["Alt + \u0001 \u0019", "Alt + \u2192"],
  ["Title A\u0001 \u0019Z", "Title A \u2192 Z"],
  ["Title Z\u0001 \u0019A", "Title Z \u2192 A"],
  ["\u0001S${", "\u2014 ${"],
  ["okmark or the \u0001\u0001& in the", "okmark or the \u2B50 in the"],
  ["}\u2B1D ", "}\u2026 "],
  ["⬝", "\u2026"],
];

for (const [from, to] of rules) t = t.split(from).join(to);

// strip any remaining control characters (except \n, \r, \t)
t = t.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");

fs.writeFileSync(FILE, t, "utf8");
const bad = (t.match(/[\u0001\uFFFD]/g) || []).length;
console.log(`Remaining lost-byte markers: ${bad}`);
