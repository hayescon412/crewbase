"use client";

import { useState, useEffect } from "react";
import { getSchedules, createSchedule, deleteSchedule, getJobs, getCrew } from "@/lib/db";
import type { Schedule, Job, CrewMember } from "@/lib/types";

function getWeekDates(offset = 0): string[] {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1) + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().split("T")[0];
  });
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function ScheduleTab() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [crew, setCrew] = useState<CrewMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<string | null>(null); // date string
  const [form, setForm] = useState({ jobId: "", crewId: "" });

  const week = getWeekDates(weekOffset);

  async function load() {
    const [schs, js, cr] = await Promise.all([
      getSchedules(week[0], week[6]), getJobs(), getCrew()
    ]);
    setSchedules(schs); setJobs(js); setCrew(cr); setLoading(false);
  }
  useEffect(() => { setLoading(true); load(); }, [weekOffset]);

  async function handleAdd(date: string) {
    if (!form.jobId || !form.crewId) return;
    await createSchedule(form.jobId, form.crewId, date);
    setAdding(null); setForm({ jobId: "", crewId: "" }); load();
  }

  function fmtDate(d: string) {
    return new Date(d + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  const isToday = (d: string) => d === new Date().toISOString().split("T")[0];

  return (
    <div className="flex flex-col gap-4">
      {/* Week nav */}
      <div className="flex items-center justify-between">
        <button onClick={() => setWeekOffset(w => w - 1)}
          className="h-9 px-4 rounded-lg border border-[#d3cec7] text-[#7a7470] text-sm hover:border-[#f26522] hover:text-[#f26522] transition-colors">
          ← Prev
        </button>
        <p className="text-[#1a1614] font-semibold text-sm">
          {fmtDate(week[0])} — {fmtDate(week[6])}
        </p>
        <button onClick={() => setWeekOffset(w => w + 1)}
          className="h-9 px-4 rounded-lg border border-[#d3cec7] text-[#7a7470] text-sm hover:border-[#f26522] hover:text-[#f26522] transition-colors">
          Next →
        </button>
      </div>

      {loading ? <p className="text-[#7a7470] text-sm text-center py-8">Loading...</p> : (
        <div className="flex flex-col gap-2">
          {week.map((date, i) => {
            const daySchedules = schedules.filter(s => s.date === date);
            const today = isToday(date);
            return (
              <div key={date} className={`bg-[#ede9e4] border rounded-2xl overflow-hidden ${today ? "border-[#f26522]/50" : "border-[#d3cec7]"}`}>
                <div className="flex items-center justify-between px-5 py-3 border-b border-[#d3cec7]">
                  <div className="flex items-center gap-3">
                    <p className={`font-semibold text-sm ${today ? "text-[#f26522]" : "text-[#1a1614]"}`}>{DAY_LABELS[i]}</p>
                    <p className="text-[#7a7470] text-xs">{fmtDate(date)}</p>
                    {today && <span className="text-[#f26522] text-xs font-medium">Today</span>}
                  </div>
                  <button onClick={() => setAdding(adding === date ? null : date)}
                    className="text-[#7a7470] text-xs hover:text-[#f26522] transition-colors">
                    {adding === date ? "Cancel" : "+ Assign"}
                  </button>
                </div>

                {daySchedules.length === 0 && adding !== date && (
                  <p className="text-[#b8b2ab] text-xs px-5 py-3">No assignments</p>
                )}

                {daySchedules.map(sch => (
                  <div key={sch.id} className="flex items-center justify-between px-5 py-3 hover:bg-[#e7e3de] group transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#d3cec7] flex items-center justify-center text-[#f26522] font-bold text-xs shrink-0">
                        {(sch as any).crew_member?.name?.[0] ?? "?"}
                      </div>
                      <div>
                        <p className="text-[#1a1614] text-sm">{(sch as any).crew_member?.name ?? "Unknown"}</p>
                        <p className="text-[#7a7470] text-xs">{(sch as any).job?.name ?? "Unknown job"}</p>
                      </div>
                    </div>
                    <button onClick={async () => { await deleteSchedule(sch.id); load(); }}
                      className="text-[#b8b2ab] hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-lg">×</button>
                  </div>
                ))}

                {adding === date && (
                  <div className="px-5 py-3 flex gap-2 border-t border-[#d3cec7]">
                    <select value={form.crewId} onChange={e => setForm(f => ({ ...f, crewId: e.target.value }))}
                      className="flex-1 input-field text-xs">
                      <option value="">Select crew</option>
                      {crew.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <select value={form.jobId} onChange={e => setForm(f => ({ ...f, jobId: e.target.value }))}
                      className="flex-1 input-field text-xs">
                      <option value="">Select job</option>
                      {jobs.filter(j => j.status !== "Complete").map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
                    </select>
                    <button onClick={() => handleAdd(date)}
                      className="h-10 px-4 rounded-xl bg-[#f26522] text-[#f7f3ef] font-bold text-sm hover:bg-[#d4541a] transition-colors">
                      Add
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <style jsx global>{`
        .input-field{background:#e4dfd9;border:1px solid #d3cec7;border-radius:12px;padding:10px 14px;color:#1a1614;font-size:14px;width:100%;outline:none;transition:border-color 0.2s;}
        .input-field:focus{border-color:#f26522;}
        .input-field option{background:#e4dfd9;}
        .input-field::placeholder{color:#b8b2ab;}
      `}</style>
    </div>
  );
}
