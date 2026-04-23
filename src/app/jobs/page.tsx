"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getJobs, toggleTask, createTask, deleteTask, createFlag } from "@/lib/db";
import type { Job } from "@/lib/types";

type JobTab = "tasks" | "crew";
type Filter = "All" | "Active" | "Wrapping Up" | "Complete";

const STATUS_COLOR: Record<string, string> = {
  Active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "Wrapping Up": "bg-[#f26522]/10 text-[#f26522] border-[#f26522]/20",
  Complete: "bg-[#d3cec7] text-[#7a7470] border-[#d3cec7]",
};

function JobCard({ job, onRefresh }: { job: Job; onRefresh: () => void }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<JobTab>("tasks");
  const [newText, setNewText] = useState("");
  const [flagOpen, setFlagOpen] = useState(false);
  const [flagText, setFlagText] = useState("");
  const [flagSent, setFlagSent] = useState(false);
  const [subCopied, setSubCopied] = useState(false);

  const tasks = job.tasks ?? [];
  const done = tasks.filter(t => t.done).length;

  async function handleAdd() {
    if (!newText.trim()) return;
    await createTask(job.id, newText.trim());
    setNewText(""); onRefresh();
  }

  async function handleFlag() {
    if (!flagText.trim()) return;
    await createFlag({ job_id: job.id, job_name: job.name, flagged_by: "Jobs Page", text: flagText.trim() });
    setFlagText(""); setFlagSent(true); setFlagOpen(false);
  }

  return (
    <div className="bg-[#ede9e4] border border-[#d3cec7] rounded-2xl overflow-hidden">
      <button className="w-full flex items-start justify-between px-5 py-5 text-left hover:bg-[#e7e3de] transition-colors"
        onClick={() => setOpen(v => !v)}>
        <div className="flex-1 pr-4">
          <p className="text-[#1a1614] text-lg font-semibold">{job.name}</p>
          {job.address && <p className="text-[#7a7470] text-sm">{job.address}</p>}
          {job.trade && <p className="text-[#7a7470] text-xs mt-0.5">{job.trade}</p>}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-1.5 bg-[#d3cec7] rounded-full overflow-hidden">
              <div className="h-full bg-[#f26522] rounded-full transition-all" style={{ width: tasks.length ? `${(done/tasks.length)*100}%` : "0%" }} />
            </div>
            <span className="text-[#7a7470] text-xs shrink-0">{done}/{tasks.length}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className={`text-xs font-medium px-3 py-1 rounded-full border ${STATUS_COLOR[job.status]}`}>{job.status}</span>
          <span className="text-[#7a7470]">{open ? "▲" : "▼"}</span>
        </div>
      </button>

      {open && (
        <div className="border-t border-[#d3cec7]">
          <div className="flex border-b border-[#d3cec7]">
            {(["tasks", "crew"] as JobTab[]).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-3 text-sm font-semibold capitalize transition-colors ${
                  tab === t ? "text-[#f26522] border-b-2 border-[#f26522] -mb-px" : "text-[#7a7470] hover:text-[#1a1614]"
                }`}>
                {t === "tasks" ? `Tasks (${done}/${tasks.length})` : `Crew (${(job.crew ?? []).length})`}
              </button>
            ))}
          </div>

          <div className="px-5 py-4 flex flex-col gap-3">
            {tab === "tasks" && (
              <>
                {tasks.map(task => (
                  <div key={task.id} className={`flex items-center gap-3 rounded-xl px-4 py-3 ${task.done ? "bg-[#ede9e4]" : "bg-[#e4dfd9]"}`}>
                    <button onClick={async () => { await toggleTask(task.id, !task.done); onRefresh(); }}
                      className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors ${task.done ? "bg-[#f26522] border-[#f26522]" : "border-[#b8b2ab] hover:border-[#f26522]"}`}>
                      {task.done && <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 7L5.5 10.5L12 3.5" stroke="#f7f3ef" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </button>
                    <span className={`flex-1 text-base ${task.done ? "line-through text-[#7a7470]" : "text-[#1a1614]"}`}>{task.text}</span>
                    <button onClick={async () => { await deleteTask(task.id); onRefresh(); }} className="text-[#b8b2ab] hover:text-red-400 transition-colors text-xl">×</button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input value={newText} onChange={e => setNewText(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAdd()}
                    placeholder="Add a task..." className="flex-1 h-12 rounded-xl bg-[#e4dfd9] border border-[#d3cec7] px-4 text-[#1a1614] text-sm placeholder-[#b8b2ab] focus:outline-none focus:border-[#f26522] transition-colors" />
                  <button onClick={handleAdd} className="h-12 px-5 rounded-xl bg-[#f26522] text-[#f7f3ef] font-bold text-lg hover:bg-[#d4541a] transition-colors">+</button>
                </div>
              </>
            )}

            {tab === "crew" && (
              <>
                {(job.crew ?? []).map(member => (
                  <div key={member.id} className="flex items-center justify-between bg-[#e4dfd9] rounded-xl px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#d3cec7] flex items-center justify-center text-[#f26522] font-bold text-sm">{member.name[0]}</div>
                      <p className="text-[#1a1614] font-medium">{member.name}</p>
                    </div>
                    <p className="text-[#7a7470] text-sm">{member.role}</p>
                  </div>
                ))}
                <Link href={`/preview/${job.id}`}
                  className="flex items-center justify-center h-11 rounded-xl border border-[#d3cec7] text-[#7a7470] text-sm font-medium hover:border-[#f26522] hover:text-[#f26522] transition-colors">
                  Client Preview →
                </Link>
                <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/sub/${job.id}`); setSubCopied(true); setTimeout(() => setSubCopied(false), 2500); }}
                  className="flex items-center justify-center h-11 rounded-xl border border-[#d3cec7] text-[#7a7470] text-sm font-medium hover:border-[#f26522] hover:text-[#f26522] transition-colors">
                  {subCopied ? "✓ Copied!" : "Copy Contractor Link"}
                </button>
              </>
            )}

            {flagSent ? (
              <div className="flex items-center justify-center h-11 rounded-xl bg-emerald-950/20 border border-emerald-800/30">
                <p className="text-emerald-400 text-sm font-medium">✓ Issue flagged</p>
              </div>
            ) : !flagOpen ? (
              <button onClick={() => setFlagOpen(true)}
                className="flex items-center justify-center gap-2 h-11 rounded-xl border border-red-900/40 text-red-400 text-sm font-medium hover:bg-red-950/20 transition-colors">
                ⚑ Flag an Issue
              </button>
            ) : (
              <div className="bg-[#e7e3de] border border-red-900/40 rounded-xl p-4 flex flex-col gap-3">
                <textarea value={flagText} onChange={e => setFlagText(e.target.value)} placeholder="Describe the issue..." rows={2}
                  className="bg-[#e4dfd9] border border-[#d3cec7] rounded-xl px-4 py-3 text-[#1a1614] text-sm placeholder-[#b8b2ab] focus:outline-none focus:border-red-800 resize-none" />
                <div className="flex gap-2">
                  <button onClick={handleFlag} className="flex-1 h-10 rounded-xl bg-red-900/60 text-red-200 font-semibold text-sm hover:bg-red-900/80 transition-colors">Submit</button>
                  <button onClick={() => { setFlagOpen(false); setFlagText(""); }} className="h-10 px-4 rounded-xl border border-[#d3cec7] text-[#7a7470] text-sm hover:text-[#1a1614] transition-colors">Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("All");
  const filters: Filter[] = ["All", "Active", "Wrapping Up", "Complete"];

  async function load() { setJobs(await getJobs()); setLoading(false); }
  useEffect(() => { load(); }, []);

  const visible = filter === "All" ? jobs : jobs.filter(j => j.status === filter);

  return (
    <div className="flex flex-col flex-1 max-w-3xl mx-auto w-full px-4 py-8 gap-6">
      <div>
        <h2 className="text-3xl font-bold text-[#1a1614]">Jobs</h2>
        <p className="text-[#7a7470] mt-1">Tap a job to see tasks and crew.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
              filter === f ? "bg-[#f26522] border-[#f26522] text-[#f7f3ef]" : "border-[#d3cec7] text-[#7a7470] hover:border-[#f26522] hover:text-[#f26522]"
            }`}>{f}</button>
        ))}
      </div>
      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 rounded-full border-2 border-[#f26522] border-t-transparent animate-spin" /></div>
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map(job => <JobCard key={job.id} job={job} onRefresh={load} />)}
        </div>
      )}
    </div>
  );
}
