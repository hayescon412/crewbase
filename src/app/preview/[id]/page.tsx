"use client";

import { use, useState, useEffect } from "react";
import { getJob, getClientUpdates, getChangeOrders, respondToChangeOrder, submitRating, getRatings, getPhotos, getSelections } from "@/lib/db";
import type { Job, ClientUpdate, ChangeOrder, Photo, Selection } from "@/lib/types";

type Tab = "updates" | "selections" | "timeline" | "photos";

const CATEGORIES = ["Cabinet Style", "Finish", "Hardware", "Crown Molding", "Flooring", "Lighting", "Other"];

function formatTime(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [job, setJob] = useState<Job | null>(null);
  const [updates, setUpdates] = useState<ClientUpdate[]>([]);
  const [changeOrders, setChangeOrders] = useState<ChangeOrder[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selections, setSelections] = useState<Selection[]>([]);
  const [hasRated, setHasRated] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [ratingSent, setRatingSent] = useState(false);
  const [tab, setTab] = useState<Tab>("updates");
  const [expandedPhoto, setExpandedPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [j, upd, cos, phs, ratings, sels] = await Promise.all([
        getJob(id), getClientUpdates(id), getChangeOrders(id), getPhotos(id), getRatings(), getSelections(id)
      ]);
      setJob(j); setUpdates(upd); setChangeOrders(cos); setPhotos(phs); setSelections(sels);
      setHasRated(ratings.some(r => r.job_id === id));
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleChangeOrder(coId: string, status: "approved" | "declined") {
    await respondToChangeOrder(coId, status);
    setChangeOrders(prev => prev.map(co => co.id === coId ? { ...co, status } : co));
  }

  async function handleRating() {
    if (rating === 0) return;
    await submitRating(id, rating, ratingComment);
    setRatingSent(true); setHasRated(true);
  }

  const tasks = job?.tasks ?? [];
  const doneTasks = tasks.filter(t => t.done);
  const pct = tasks.length ? Math.round((doneTasks.length / tasks.length) * 100) : 0;
  const pendingCOs = changeOrders.filter(co => co.status === "pending");

  // Group selections by category, only categories that have images
  const groupedSelections = CATEGORIES.reduce((acc, cat) => {
    const items = selections.filter(s => s.category === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {} as Record<string, Selection[]>);

  if (loading) return (
    <div className="flex flex-1 items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-[#f26522] border-t-transparent animate-spin" />
    </div>
  );

  if (!job) return (
    <div className="flex flex-1 items-center justify-center flex-col gap-3 text-center px-6">
      <p className="text-4xl">🔍</p>
      <p className="text-[#1a1614] font-bold text-xl">Project not found</p>
      <p className="text-[#7a7470]">This preview link may be invalid or expired.</p>
    </div>
  );

  return (
    <div className="flex flex-col flex-1 max-w-2xl mx-auto w-full px-4 py-8 gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-[#f26522] font-bold text-sm">Crewbase</span>
          <span className="text-[#d3cec7]">·</span>
          <span className="text-[#7a7470] text-sm">Client Preview</span>
        </div>
        <h2 className="text-3xl font-bold text-[#1a1614]">{job.name}</h2>
        {job.address && <p className="text-[#7a7470]">{job.address}</p>}
        {job.trade && <p className="text-[#7a7470] text-sm">{job.trade}</p>}
      </div>

      {/* Progress */}
      <div className="bg-[#ede9e4] border border-[#d3cec7] rounded-2xl p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-[#1a1614] font-semibold">Overall Progress</p>
          <span className="text-[#f26522] font-bold text-xl">{pct}%</span>
        </div>
        <div className="h-2 bg-[#d3cec7] rounded-full overflow-hidden">
          <div className="h-full bg-[#f26522] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-[#7a7470] text-sm">{doneTasks.length} of {tasks.length} tasks complete · Status: {job.status}</p>
      </div>

      {/* Pending change orders banner */}
      {pendingCOs.length > 0 && (
        <div className="bg-[#f26522]/10 border border-[#f26522]/40 rounded-2xl p-4">
          <p className="text-[#f26522] font-semibold text-sm mb-3">⚠ {pendingCOs.length} Change Order{pendingCOs.length > 1 ? "s" : ""} Awaiting Your Approval</p>
          {pendingCOs.map(co => (
            <div key={co.id} className="bg-[#ede9e4] rounded-xl p-4 flex flex-col gap-3 mb-2 last:mb-0">
              <div>
                <p className="text-[#1a1614] font-medium">{co.description}</p>
                {co.amount > 0 && <p className="text-[#f26522] text-sm mt-0.5">+${co.amount.toLocaleString()}</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleChangeOrder(co.id, "approved")}
                  className="flex-1 h-10 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-700 font-semibold text-sm hover:bg-emerald-200 transition-colors">
                  Approve
                </button>
                <button onClick={() => handleChangeOrder(co.id, "declined")}
                  className="flex-1 h-10 rounded-xl bg-red-100 border border-red-300 text-red-600 font-semibold text-sm hover:bg-red-200 transition-colors">
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-[#ede9e4] border border-[#d3cec7] rounded-xl p-1">
        {(["updates", "selections", "photos", "timeline"] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
              tab === t ? "bg-[#f26522] text-[#f7f3ef]" : "text-[#7a7470] hover:text-[#1a1614]"
            }`}>{t}</button>
        ))}
      </div>

      {/* Updates */}
      {tab === "updates" && (
        <div className="flex flex-col gap-3">
          {updates.length === 0 ? (
            <div className="bg-[#ede9e4] border border-[#d3cec7] rounded-2xl px-5 py-10 flex flex-col items-center gap-2 text-center">
              <p className="text-3xl">📬</p>
              <p className="text-[#7a7470] text-sm">No updates yet. Your crew will send photos and messages here as work progresses.</p>
            </div>
          ) : updates.map(update => (
            <div key={update.id} className="bg-[#ede9e4] border border-[#d3cec7] rounded-2xl overflow-hidden">
              {update.photo_url && (
                <button className="w-full" onClick={() => setExpandedPhoto(expandedPhoto === update.id ? null : update.id)}>
                  <img src={update.photo_url} alt={update.photo_name ?? "Photo"} className={`w-full object-cover transition-all duration-300 ${expandedPhoto === update.id ? "max-h-[500px]" : "max-h-52"}`} />
                </button>
              )}
              <div className="px-5 py-4 flex flex-col gap-2">
                {update.message && <p className="text-[#1a1614] text-base leading-relaxed">{update.message}</p>}
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#d3cec7] flex items-center justify-center text-[#f26522] font-bold text-xs">{(update.sent_by ?? "?")[0]}</div>
                  <p className="text-[#7a7470] text-xs">{update.sent_by} · {formatTime(update.created_at)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selections */}
      {tab === "selections" && (
        <div className="flex flex-col gap-5">
          {selections.length === 0 ? (
            <div className="bg-[#ede9e4] border border-[#d3cec7] rounded-2xl px-5 py-10 flex flex-col items-center gap-2 text-center">
              <p className="text-3xl">🎨</p>
              <p className="text-[#1a1614] font-semibold">No selections yet</p>
              <p className="text-[#7a7470] text-sm">Your project manager will upload your cabinet styles, finishes, hardware, and more here for your review.</p>
            </div>
          ) : (
            Object.entries(groupedSelections).map(([cat, items]) => (
              <div key={cat} className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <p className="text-[#1a1614] font-bold text-base">{cat}</p>
                  <div className="flex-1 h-px bg-[#d3cec7]" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {items.map(sel => (
                    <div key={sel.id} className="rounded-2xl overflow-hidden bg-[#ede9e4] border border-[#d3cec7]">
                      <img src={sel.url} alt={sel.label ?? cat} className="w-full h-40 object-cover" />
                      {sel.label && (
                        <div className="px-3 py-2">
                          <p className="text-[#1a1614] text-sm font-semibold">{sel.label}</p>
                          <p className="text-[#7a7470] text-xs">{cat}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
          <div className="bg-[#ede9e4] border border-[#d3cec7] rounded-xl px-4 py-3">
            <p className="text-[#7a7470] text-xs">Questions about your selections? Contact your project manager directly.</p>
          </div>
        </div>
      )}

      {/* Photos */}
      {tab === "photos" && (
        <div className="flex flex-col gap-3">
          {photos.length === 0 ? (
            <p className="text-[#7a7470] text-sm text-center py-8">No project photos yet.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {photos.map(photo => (
                <div key={photo.id} className="rounded-2xl overflow-hidden bg-[#ede9e4] border border-[#d3cec7]">
                  <img src={photo.url} alt={photo.caption ?? ""} className="w-full h-40 object-cover" />
                  {photo.caption && <p className="text-[#7a7470] text-xs px-3 py-2">{photo.caption}</p>}
                  {photo.taken_by && <p className="text-[#b8b2ab] text-xs px-3 pb-2">{photo.taken_by} · {formatTime(photo.created_at)}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Timeline */}
      {tab === "timeline" && (
        <div className="flex flex-col gap-3">
          <p className="text-[#7a7470] text-sm">Project phases and progress at a glance.</p>
          {tasks.length === 0 ? (
            <p className="text-[#7a7470] text-sm text-center py-8">No tasks set yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {tasks.map((task, i) => (
                <div key={task.id} className="flex items-center gap-4">
                  <div className="flex flex-col items-center shrink-0">
                    <div className={`w-4 h-4 rounded-full border-2 ${task.done ? "bg-[#f26522] border-[#f26522]" : "border-[#b8b2ab] bg-transparent"}`} />
                    {i < tasks.length - 1 && <div className={`w-0.5 h-6 ${task.done ? "bg-[#f26522]" : "bg-[#d3cec7]"}`} />}
                  </div>
                  <span className={`text-sm ${task.done ? "text-[#7a7470] line-through" : "text-[#1a1614]"}`}>{task.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Rating section */}
      {job.status === "Complete" && !hasRated && !ratingSent && (
        <div className="bg-[#ede9e4] border border-[#d3cec7] rounded-2xl p-5 flex flex-col gap-4">
          <p className="text-[#1a1614] font-semibold">How did we do?</p>
          <div className="flex gap-2 justify-center">
            {[1,2,3,4,5].map(s => (
              <button key={s} onClick={() => setRating(s)}
                className={`w-12 h-12 rounded-xl text-2xl transition-all ${rating >= s ? "bg-[#f26522] scale-110" : "bg-[#e4dfd9] border border-[#d3cec7] hover:border-[#f26522]"}`}>
                ★
              </button>
            ))}
          </div>
          <textarea value={ratingComment} onChange={e => setRatingComment(e.target.value)} placeholder="Optional comment..." rows={2}
            className="bg-[#e4dfd9] border border-[#d3cec7] rounded-xl px-4 py-3 text-[#1a1614] text-sm placeholder-[#b8b2ab] focus:outline-none focus:border-[#f26522] resize-none" />
          <button onClick={handleRating} disabled={rating === 0}
            className="h-11 rounded-xl bg-[#f26522] text-[#f7f3ef] font-bold hover:bg-[#d4541a] transition-colors disabled:opacity-40">
            Submit Rating
          </button>
        </div>
      )}
      {(ratingSent || (job.status === "Complete" && hasRated)) && (
        <div className="flex items-center justify-center h-14 bg-emerald-100 border border-emerald-300 rounded-2xl">
          <p className="text-emerald-700 font-medium">✓ Thanks for your feedback!</p>
        </div>
      )}

      <p className="text-[#b8b2ab] text-xs text-center pb-4">Powered by Crewbase · Bookmark this page for updates</p>
    </div>
  );
}
