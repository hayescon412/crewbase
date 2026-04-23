"use client";

import { useState, useEffect } from "react";
import { getJobs, getCrew, toggleTask, createFlag } from "@/lib/db";
import type { Job, CrewMember } from "@/lib/types";

function TodayJobSection({ job, crewName, onRefresh }: { job: Job; crewName: string; onRefresh: () => void }) {
  const tasks = job.tasks ?? [];
  const incomplete = tasks.filter(t => !t.done);
  const done = tasks.filter(t => t.done);
  const [showDone, setShowDone] = useState(false);
  const [flagOpen, setFlagOpen] = useState(false);
  const [flagText, setFlagText] = useState("");
  const [flagSent, setFlagSent] = useState(false);

  async function handleFlag() {
    if (!flagText.trim()) return;
    await createFlag({ job_id: job.id, job_name: job.name, flagged_by: crewName, text: flagText.trim() });
    setFlagText(""); setFlagSent(true); setFlagOpen(false);
  }

  return (
    <div className="bg-[#ede9e4] border border-[#d3cec7] rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-[#d3cec7] flex items-center justify-between">
        <div>
          <p className="text-[#1a1614] font-bold text-lg">{job.name}</p>
          <p className="text-[#7a7470] text-sm">{job.address}{job.trade ? ` · ${job.trade}` : ""}</p>
        </div>
        <span className="text-[#7a7470] text-sm">{done.length}/{tasks.length} done</span>
      </div>
      <div className="h-1 bg-[#d3cec7]">
        <div className="h-full bg-[#f26522] transition-all duration-300" style={{ width: tasks.length ? `${(done.length/tasks.length)*100}%` : "0%" }} />
      </div>
      <div className="px-5 py-4 flex flex-col gap-2">
        {incomplete.length === 0 && <p className="text-emerald-400 text-base font-medium py-2">✓ All tasks complete</p>}
        {incomplete.map(task => (
          <button key={task.id} onClick={async () => { await toggleTask(task.id, true); onRefresh(); }}
            className="flex items-center gap-4 bg-[#e4dfd9] rounded-xl px-4 py-4 text-left hover:bg-[#dedad4] transition-colors w-full">
            <div className="w-8 h-8 rounded-lg border-2 border-[#b8b2ab] shrink-0 hover:border-[#f26522] transition-colors" />
            <span className="text-[#1a1614] text-base">{task.text}</span>
          </button>
        ))}
        {done.length > 0 && (
          <>
            <button onClick={() => setShowDone(v => !v)} className="text-[#7a7470] text-sm hover:text-[#1a1614] transition-colors mt-1">
              {showDone ? "Hide" : "Show"} {done.length} completed
            </button>
            {showDone && done.map(task => (
              <button key={task.id} onClick={async () => { await toggleTask(task.id, false); onRefresh(); }}
                className="flex items-center gap-4 bg-[#ede9e4] rounded-xl px-4 py-4 text-left hover:bg-[#e7e3de] transition-colors w-full">
                <div className="w-8 h-8 rounded-lg bg-[#f26522] border-2 border-[#f26522] flex items-center justify-center shrink-0">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7L5.5 10.5L12 3.5" stroke="#f7f3ef" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <span className="text-[#7a7470] text-base line-through">{task.text}</span>
              </button>
            ))}
          </>
        )}
        {flagSent ? (
          <div className="flex items-center justify-center h-11 rounded-xl bg-emerald-950/20 border border-emerald-800/30 mt-2">
            <p className="text-emerald-400 text-sm font-medium">✓ Issue flagged</p>
          </div>
        ) : !flagOpen ? (
          <button onClick={() => setFlagOpen(true)} className="mt-2 flex items-center justify-center gap-2 h-11 rounded-xl border border-red-900/50 text-red-400 text-sm font-medium hover:bg-red-950/30 transition-colors">
            ⚑ Flag an Issue
          </button>
        ) : (
          <div className="bg-[#ede9e4] border border-red-900/40 rounded-xl p-4 flex flex-col gap-3 mt-2">
            <textarea value={flagText} onChange={e => setFlagText(e.target.value)} placeholder="Describe the issue..." rows={2}
              className="bg-[#e4dfd9] border border-[#d3cec7] rounded-xl px-4 py-3 text-[#1a1614] text-sm placeholder-[#b8b2ab] focus:outline-none focus:border-red-800 resize-none" />
            <div className="flex gap-2">
              <button onClick={handleFlag} className="flex-1 h-10 rounded-xl bg-red-900/60 text-red-200 font-semibold text-sm hover:bg-red-900/80 transition-colors">Submit</button>
              <button onClick={() => { setFlagOpen(false); setFlagText(""); }} className="h-10 px-4 rounded-xl border border-[#d3cec7] text-[#7a7470] text-sm transition-colors">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TodayPage() {
  const [selected, setSelected] = useState<CrewMember | null>(null);
  const [allCrew, setAllCrew] = useState<CrewMember[]>([]);
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCrew().then(crew => { setAllCrew(crew); });
    const stored = sessionStorage.getItem("crewbase_crew_member");
    if (stored) { const m = JSON.parse(stored) as CrewMember; setSelected(m); loadJobs(m.name); }
    setChecked(true);
  }, []);

  async function loadJobs(name: string) {
    setLoading(true);
    const all = await getJobs();
    setMyJobs(all.filter(j => j.status !== "Complete" && (j.crew ?? []).some(c => c.name === name)));
    setLoading(false);
  }

  function selectMember(m: CrewMember) {
    sessionStorage.setItem("crewbase_crew_member", JSON.stringify(m));
    setSelected(m); loadJobs(m.name);
  }

  function switchUser() { sessionStorage.removeItem("crewbase_crew_member"); setSelected(null); setMyJobs([]); }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  if (!checked) return null;

  if (!selected) return (
    <div className="flex flex-col flex-1 items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[#1a1614]">Who are you?</h2>
          <p className="text-[#7a7470] mt-2">Pick your name to see your tasks.</p>
        </div>
        {allCrew.length === 0 ? (
          <p className="text-[#7a7470] text-sm text-center">No crew members found. Ask your admin to add crew.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {allCrew.map(m => (
              <button key={m.id} onClick={() => selectMember(m)}
                className="flex items-center gap-4 h-16 px-5 rounded-2xl bg-[#ede9e4] border border-[#d3cec7] hover:border-[#f26522] hover:bg-[#e7e3de] transition-colors text-left">
                <div className="w-10 h-10 rounded-full bg-[#d3cec7] flex items-center justify-center text-[#f26522] font-bold shrink-0">{m.name[0]}</div>
                <div>
                  <p className="text-[#1a1614] font-semibold text-lg">{m.name}</p>
                  <p className="text-[#7a7470] text-sm">{m.role}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col flex-1 max-w-2xl mx-auto w-full px-4 py-8 gap-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[#f26522] text-sm font-medium">{greeting},</p>
          <h2 className="text-3xl font-bold text-[#1a1614]">{selected.name}</h2>
          <p className="text-[#7a7470] mt-1">{myJobs.length === 0 ? "No active jobs." : `${myJobs.length} active job${myJobs.length !== 1 ? "s" : ""}.`}</p>
        </div>
        <button onClick={switchUser} className="text-[#7a7470] text-sm border border-[#d3cec7] px-3 py-2 rounded-lg hover:border-[#7a7470] hover:text-[#1a1614] transition-colors mt-1">Switch</button>
      </div>
      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 rounded-full border-2 border-[#f26522] border-t-transparent animate-spin" /></div>
      ) : myJobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-3 text-center"><p className="text-5xl">👷</p><p className="text-[#7a7470] text-lg">No active jobs right now.</p></div>
      ) : (
        <div className="flex flex-col gap-4">
          {myJobs.map(job => <TodayJobSection key={job.id} job={job} crewName={selected.name} onRefresh={() => loadJobs(selected.name)} />)}
        </div>
      )}
    </div>
  );
}
