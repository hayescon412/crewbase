"use client";

import { useState, useEffect } from "react";
import { getFlags, resolveFlag } from "@/lib/db";
import type { Flag } from "@/lib/types";

export default function FlagsTab() {
  const [flags, setFlags] = useState<Flag[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() { setFlags(await getFlags()); setLoading(false); }
  useEffect(() => { load(); }, []);

  const open = flags.filter(f => !f.resolved);
  const resolved = flags.filter(f => f.resolved);

  function fmt(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="flex flex-col gap-6">
      {loading ? <p className="text-[#7a7470] text-sm text-center py-8">Loading...</p> :
        flags.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3 text-center">
            <p className="text-4xl">✓</p>
            <p className="text-[#1a1614] font-semibold text-lg">No issues flagged</p>
            <p className="text-[#7a7470] text-sm">When crew flags a problem, it shows up here.</p>
          </div>
        ) : (
          <>
            {open.length > 0 && (
              <div className="flex flex-col gap-3">
                <p className="text-red-400 text-sm font-medium uppercase tracking-widest">Open — {open.length}</p>
                {open.map(flag => (
                  <div key={flag.id} className="bg-[#ede9e4] border border-red-900/40 rounded-2xl p-5 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[#1a1614] font-semibold">{flag.job_name}</p>
                        <p className="text-[#7a7470] text-xs mt-0.5">
                          {flag.flagged_by && `${flag.flagged_by} · `}{fmt(flag.created_at)}
                        </p>
                      </div>
                      <span className="text-red-400 text-xs font-medium px-2 py-1 rounded-full border border-red-900/40 shrink-0">Open</span>
                    </div>
                    <p className="text-[#1a1614] bg-[#e4dfd9] rounded-xl px-4 py-3">{flag.text}</p>
                    <button onClick={async () => { await resolveFlag(flag.id); load(); }}
                      className="h-10 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-emerald-400 text-sm font-medium hover:bg-emerald-950/50 transition-colors">
                      Mark Resolved
                    </button>
                  </div>
                ))}
              </div>
            )}
            {resolved.length > 0 && (
              <div className="flex flex-col gap-3">
                <p className="text-[#7a7470] text-sm font-medium uppercase tracking-widest">Resolved</p>
                {resolved.map(flag => (
                  <div key={flag.id} className="bg-[#ede9e4] border border-[#d3cec7] rounded-2xl p-5 flex flex-col gap-2 opacity-50">
                    <p className="text-[#1a1614] font-semibold">{flag.job_name}</p>
                    <p className="text-[#7a7470] text-sm">{flag.text}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )
      }
    </div>
  );
}
