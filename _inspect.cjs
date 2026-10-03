const fs=require('fs');
const file='src/components/nexus/NexusShell.tsx';
let f=fs.readFileSync(file,'utf8');
const old=`{/* NexusVPN toolbar entry — always visible, never hidden by themes */}
        <button
          onClick={() => handleNavigate("nexus://vpn")}
          aria-label="NexusVPN"
          title="NexusVPN"
          className="group relative grid h-8 w-8 place-items-center rounded-full text-white/60 transition hover:bg-white/[0.06] hover:text-white"
        >
          <span className="grid h-[18px] w-[18px] place-items-center">
            <ShieldCheck className="h-[18px] w-[18px] transition-all group-hover:drop-shadow-[0_0_6px_rgba(59,130,242,0.8)]" />
          </span>
          <span
            className="absolute bottom-[3px] right-[3px] h-2 w-2 rounded-full border border-[#05070d] bg-amber-400"
            title="NexusVPN not connected"
          />
        </button>`;
const idx=f.indexOf(old);
console.log('found at:', idx);
if (idx < 0) {
  console.log('NOT FOUND - dumping surrounding');
  const i2 = f.indexOf('NexusVPN toolbar entry');
  console.log(JSON.stringify(f.substring(i2-5, i2+400)));
  process.exit(1);
}
const replacement=`{/* NexusVPN toolbar entry — always visible, never hidden by themes.
            Reflects the REAL connector state (disconnected / connecting / connected / error). */}
        <button
          onClick={() => handleNavigate("nexus://vpn")}
          aria-label="NexusVPN"
          title={"NexusVPN — " + (vpnStatus.message || vpnStatus.state)}
          className="group relative grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#0a0f1e]/80 text-white/60 shadow-[0_0_12px_rgba(59,130,242,0.25)] ring-1 ring-white/[0.08] transition-all hover:bg-white/[0.08] hover:text-white hover:shadow-[0_0_18px_rgba(59,130,242,0.5)]"
        >
          <ShieldCheck
            className={`h-[18px] w-[18px] transition-all ${vpnStatus.state === "connected" ? "text-emerald-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]" : vpnStatus.state === "connecting" || vpnStatus.state === "reconnecting" ? "text-[#60a5fa] drop-shadow-[0_0_8px_rgba(59,130,242,0.8)] animate-pulse" : vpnStatus.state === "error" ? "text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" : "text-white/55"}`}
          />
          {(vpnStatus.state === "connecting" || vpnStatus.state === "reconnecting") && (
            <svg
              className="-rotate-90 absolute inset-0 -m-5 h-9 w-9 animate-spin rounded-full border-2 border-[#3b82f6]/20 border-t-[#3b82f6]"
              aria-hidden="true"
            />
          )}
          <span
            className={`absolute bottom-[3px] right-[3px] h-2 w-2 rounded-full border-2 border-[#05070d] ${vpnStatus.state === "connected" ? "bg-emerald-400 shadow-[0_0_6px_rgba(34,197,94,0.7)]" : vpnStatus.state === "connecting" || vpnStatus.state === "reconnecting" ? "bg-[#60a5fa] shadow-[0_0_6px_rgba(59,130,242,0.7)]" : vpnStatus.state === "error" ? "bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.7)]" : "bg-white/30"}`}
          />
        </button>`;
f = f.replace(old, replacement);
fs.writeFileSync(file, f, 'utf8');
console.log('replaced OK');

