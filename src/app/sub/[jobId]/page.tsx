"use client";

import { use, useState, useEffect } from "react";
import { getJob, toggleTask, createFlag } from "@/lib/db";
import type { Job } from "@/lib/types";

export default function SubPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = use(params);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getJob(jobId).then(j => { setJob(j); setLoading(false); });
  }, [jobId]);

  if (loading) return (
    <div className="flex flex-1 items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-[#f26522] border-t-transparent animate-spin" />
    </div>
  );

  if (!job) return (
    <div className="flex flex-col flex-1 items-center justify-center px-6 text-center gap-4">
      <p className="text-5xl">🔒</p>
      <h2 className="text-2xl font-bold text-[#1a1614]">This link is no longer active</h2>
      <p className="text-[#7a7470] max-w-sm">This contractor link has been revoked or expired. Contact your project manager for access.</p>
    </div>
  );

  return <SubView job={job} onTaskToggle={async (taskId, done) => {
    await toggleTask(taskId, done);
    const updated = await getJob(jobId);
    if (updated) setJob(updated);
  }} />;
}

function SubView({ job, onTaskToggle }: { job: Job; onTaskToggle: (taskId: string, done: boolean) => Promise<void> }) {
  const [flagText, setFlagText] = useState("");
  const [flagSent, setFlagSent] = useState(false);
  const [showFlagForm, setShowFlagForm] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);

  const tasks = job.tasks ?? [];
  const doneCount = tasks.filter(t => t.done).length;
  const pct = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;

  async function handleToggle(taskId: string, currentDone: boolean) {
    setToggling(taskId);
    await onTaskToggle(taskId, !currentDone);
    setToggling(null);
  }

  async function submitFlag() {
    if (!flagText.trim()) return;
    await createFlag({ job_id: job.id, job_name: job.name, flagged_by: "Subcontractor", text: flagText.trim() });
    setFlagText("");
    setFlagSent(true);
    setShowFlagForm(false);
  }

  return (
    <div className="flex flex-col flex-1 max-w-2xl mx-auto w-full px-4 py-8 gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-[#f26522] font-bold text-sm tracking-wide">Crewbase</span>
          <span className="text-[#d3cec7]">·</span>
          <span className="text-[#7a7470] text-sm">Contractor View</span>
        </div>
        <h2 className="text-3xl font-bold text-[#1a1614]">{job.name}</h2>
        {(job.address || job.trade) && (
          <p className="text-[#7a7470]">{[job.address, job.trade].filter(Boolean).join(" · ")}</p>
        )}
      </div>

      {/* Progress */}
      <div className="bg-[#ede9e4] border border-[#d3cec7] rounded-2xl p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-[#1a1614] font-semibold">Job Progress</p>
          <span className="text-[#f26522] font-bold text-lg">{pct}%</span>
        </div>
        <div className="h-2 bg-[#d3cec7] rounded-full overflow-hidden">
          <div className="h-full bg-[#f26522] rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-[#7a7470] text-sm">{doneCount} of {tasks.length} tasks complete</p>
      </div>

      {/* Task list */}
      {tasks.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-[#7a7470] text-sm font-medium uppercase tracking-widest px-1">Tasks</p>
          {tasks.map(task => (
            <button key={task.id} onClick={() => handleToggle(task.id, task.done)}
              disabled={toggling === task.id}
              className={`flex items-center gap-4 rounded-xl px-4 py-4 text-left transition-colors w-full ${
                task.done ? "bg-[#ede9e4]" : "bg-[#e4dfd9] hover:bg-[#dedad4]"
              } disabled:opacity-60`}>
              <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors ${
                task.done ? "bg-[#f26522] border-[#f26522]" : "border-[#b8b2ab]"
              }`}>
                {task.done && (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7L5.5 10.5L12 3.5" stroke="#f7f3ef" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className={`text-base ${task.done ? "line-through text-[#7a7470]" : "text-[#1a1614]"}`}>{task.text}</span>
            </button>
          ))}
        </div>
      )}

      {/* Flag issue */}
      <div className="flex flex-col gap-3">
        {flagSent && (
          <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl px-4 py-3">
            <p className="text-emerald-400 text-sm font-medium">✓ Issue flagged — your admin has been notified.</p>
          </div>
        )}
        {!showFlagForm ? (
          <button onClick={() => setShowFlagForm(true)}
            className="flex items-center justify-center gap-2 h-12 rounded-xl border border-red-900/50 text-red-400 text-sm font-medium hover:bg-red-950/30 transition-colors">
            ⚑ Flag an Issue
          </button>
        ) : (
          <div className="bg-[#ede9e4] border border-red-900/40 rounded-xl p-4 flex flex-col gap-3">
            <p className="text-red-400 text-sm font-medium">Describe the issue</p>
            <textarea value={flagText} onChange={e => setFlagText(e.target.value)}
              placeholder="e.g. Wrong cabinet doors delivered, missing hardware box..."
              rows={3}
              className="bg-[#e4dfd9] border border-[#d3cec7] rounded-xl px-4 py-3 text-[#1a1614] text-sm placeholder-[#b8b2ab] focus:outline-none focus:border-red-800 resize-none" />
            <div className="flex gap-2">
              <button onClick={submitFlag}
                className="flex-1 h-11 rounded-xl bg-red-900/60 text-red-200 font-semibold text-sm hover:bg-red-900/80 transition-colors">
                Submit Flag
              </button>
              <button onClick={() => { setShowFlagForm(false); setFlagText(""); }}
                className="h-11 px-4 rounded-xl border border-[#d3cec7] text-[#7a7470] text-sm hover:text-[#1a1614] transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="text-[#b8b2ab] text-xs text-center pb-4">Powered by Crewbase · Contractor access only</p>
    </div>
  );
}
