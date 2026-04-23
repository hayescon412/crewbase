"use client";

import { useState, useEffect } from "react";
import {
  getJobs, createJob, updateJob, deleteJob,
  getCrew, assignCrewToJob, removeCrewFromJob,
  createTask, toggleTask, deleteTask,
  getMaterials, createMaterial, updateMaterialStatus, deleteMaterial,
  getChangeOrders, createChangeOrder,
  generateInvoice, getInvoices, updateInvoiceStatus,
  uploadPhoto, getPhotos, deletePhoto,
  createClientUpdate,
  getSelections, uploadSelection, deleteSelection,
} from "@/lib/db";
import type { Job, CrewMember, Task, Material, ChangeOrder, Invoice, Photo, Selection } from "@/lib/types";

const STATUSES = ["Active", "Wrapping Up", "Complete"] as const;
const MATERIAL_STATUSES: Material["status"][] = ["needed", "ordered", "on_site"];
const MATERIAL_LABELS = { needed: "Needed", ordered: "Ordered", on_site: "On Site" };
const MATERIAL_COLORS = {
  needed: "text-red-400 border-red-900/40",
  ordered: "text-[#f26522] border-[#f26522]/40",
  on_site: "text-emerald-400 border-emerald-800/40",
};

export default function JobsTab() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [allCrew, setAllCrew] = useState<CrewMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [innerTab, setInnerTab] = useState<Record<string, string>>({});
  const [showNewForm, setShowNewForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [newTask, setNewTask] = useState<Record<string, string>>({});
  const [newMaterial, setNewMaterial] = useState<Record<string, { name: string; qty: string }>>({});
  const [newCO, setNewCO] = useState<Record<string, { desc: string; amount: string }>>({});
  const [materials, setMaterials] = useState<Record<string, Material[]>>({});
  const [changeOrders, setChangeOrders] = useState<Record<string, ChangeOrder[]>>({});
  const [invoices, setInvoices] = useState<Record<string, Invoice[]>>({});
  const [photos, setPhotos] = useState<Record<string, Photo[]>>({});
  const [selections, setSelections] = useState<Record<string, Selection[]>>({});
  const [selCategory, setSelCategory] = useState<Record<string, string>>({});
  const [updateMsg, setUpdateMsg] = useState<Record<string, string>>({});
  const [subLinkCopied, setSubLinkCopied] = useState<string | null>(null);
  const [clientLinkCopied, setClientLinkCopied] = useState<string | null>(null);

  const blankForm = { name: "", address: "", trade: "", status: "Active" as const, client_name: "", client_email: "", value: "" };
  const [form, setForm] = useState(blankForm);

  async function load() {
    const [js, crew] = await Promise.all([getJobs(), getCrew()]);
    setJobs(js); setAllCrew(crew); setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function loadExtras(jobId: string) {
    const [mats, cos, invs, phs, sels] = await Promise.all([
      getMaterials(jobId), getChangeOrders(jobId), getInvoices(), getPhotos(jobId), getSelections(jobId)
    ]);
    setMaterials(p => ({ ...p, [jobId]: mats }));
    setChangeOrders(p => ({ ...p, [jobId]: cos }));
    setInvoices(p => ({ ...p, [jobId]: invs.filter(i => i.job_id === jobId) }));
    setPhotos(p => ({ ...p, [jobId]: phs }));
    setSelections(p => ({ ...p, [jobId]: sels }));
  }

  function toggleExpand(id: string) {
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    setInnerTab(t => ({ ...t, [id]: t[id] ?? "tasks" }));
    loadExtras(id);
  }

  async function handleSaveJob() {
    if (!form.name.trim()) return;
    if (editingJob) {
      await updateJob(editingJob.id, { ...form, value: parseFloat(form.value) || 0 });
    } else {
      await createJob({ ...form, value: parseFloat(form.value) || 0 });
    }
    setForm(blankForm); setShowNewForm(false); setEditingJob(null); load();
  }

  async function handleDeleteJob(id: string) {
    if (!confirm("Delete this job and all its data?")) return;
    await deleteJob(id); load();
  }

  async function handleAddTask(jobId: string) {
    const text = newTask[jobId]?.trim();
    if (!text) return;
    await createTask(jobId, text);
    setNewTask(t => ({ ...t, [jobId]: "" }));
    load();
  }

  async function handleAddMaterial(jobId: string) {
    const { name, qty } = newMaterial[jobId] ?? { name: "", qty: "" };
    if (!name.trim()) return;
    await createMaterial(jobId, name.trim(), qty.trim() || undefined);
    setNewMaterial(m => ({ ...m, [jobId]: { name: "", qty: "" } }));
    loadExtras(jobId);
  }

  async function handleAddCO(jobId: string) {
    const { desc, amount } = newCO[jobId] ?? { desc: "", amount: "" };
    if (!desc.trim()) return;
    await createChangeOrder({ job_id: jobId, description: desc.trim(), amount: parseFloat(amount) || 0 });
    setNewCO(c => ({ ...c, [jobId]: { desc: "", amount: "" } }));
    loadExtras(jobId);
  }

  async function handleGenInvoice(jobId: string) {
    await generateInvoice(jobId); loadExtras(jobId);
  }

  async function handlePhotoUpload(jobId: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const caption = window.prompt("Add a caption (optional):") ?? undefined;
    await uploadPhoto(jobId, file, caption, "Admin");
    loadExtras(jobId);
  }

  async function handleSelectionUpload(jobId: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const category = selCategory[jobId] ?? "Cabinet Style";
    const label = window.prompt("Add a label (optional, e.g. 'Shaker White'):") ?? undefined;
    await uploadSelection(jobId, file, category, label);
    e.target.value = "";
    loadExtras(jobId);
  }

  async function sendClientUpdate(jobId: string) {
    const msg = updateMsg[jobId]?.trim();
    if (!msg) return;
    await createClientUpdate({ job_id: jobId, message: msg, sent_by: "Admin" });
    setUpdateMsg(m => ({ ...m, [jobId]: "" }));
    alert("Update sent to client preview.");
  }

  function copyLink(type: "sub" | "client", jobId: string) {
    const url = `${window.location.origin}/${type === "sub" ? "sub" : "preview"}/${jobId}`;
    navigator.clipboard.writeText(url);
    if (type === "sub") { setSubLinkCopied(jobId); setTimeout(() => setSubLinkCopied(null), 2500); }
    else { setClientLinkCopied(jobId); setTimeout(() => setClientLinkCopied(null), 2500); }
  }

  const statusColor: Record<string, string> = {
    Active: "text-emerald-400", "Wrapping Up": "text-[#f26522]", Complete: "text-[#7a7470]",
  };

  return (
    <div className="flex flex-col gap-4">
      {/* New job button */}
      {!showNewForm && !editingJob && (
        <button onClick={() => setShowNewForm(true)}
          className="flex items-center justify-center h-12 rounded-xl border border-dashed border-[#b8b2ab] text-[#7a7470] hover:border-[#f26522] hover:text-[#f26522] transition-colors">
          + New Job
        </button>
      )}

      {/* Job form */}
      {(showNewForm || editingJob) && (
        <div className="bg-[#ede9e4] border border-[#f26522]/30 rounded-2xl p-5 flex flex-col gap-4">
          <p className="text-[#f26522] font-semibold">{editingJob ? "Edit Job" : "New Job"}</p>
          <div className="grid grid-cols-2 gap-3">
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Job name *" className="col-span-2 input-field" />
            <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              placeholder="Address" className="col-span-2 input-field" />
            <input value={form.trade} onChange={e => setForm(f => ({ ...f, trade: e.target.value }))}
              placeholder="Trade (e.g. Cabinetry)" className="input-field" />
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))}
              className="input-field">
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input value={form.client_name} onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))}
              placeholder="Client name" className="input-field" />
            <input value={form.client_email} onChange={e => setForm(f => ({ ...f, client_email: e.target.value }))}
              placeholder="Client email" className="input-field" />
            <input value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
              placeholder="Job value ($)" type="number" className="col-span-2 input-field" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleSaveJob}
              className="flex-1 h-11 rounded-xl bg-[#f26522] text-[#f7f3ef] font-bold hover:bg-[#d4541a] transition-colors">
              {editingJob ? "Save Changes" : "Create Job"}
            </button>
            <button onClick={() => { setShowNewForm(false); setEditingJob(null); setForm(blankForm); }}
              className="h-11 px-5 rounded-xl border border-[#d3cec7] text-[#7a7470] hover:text-[#1a1614] transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Job cards */}
      {loading ? <p className="text-[#7a7470] text-sm text-center py-8">Loading...</p> : jobs.map(job => {
        const open = expandedId === job.id;
        const tab = innerTab[job.id] ?? "tasks";
        const jobTasks = job.tasks ?? [];
        const doneCount = jobTasks.filter(t => t.done).length;

        return (
          <div key={job.id} className="bg-[#ede9e4] border border-[#d3cec7] rounded-2xl overflow-hidden">
            {/* Header */}
            <button className="w-full flex items-start justify-between px-5 py-5 text-left hover:bg-[#e7e3de] transition-colors"
              onClick={() => toggleExpand(job.id)}>
              <div className="flex-1 pr-4">
                <p className="text-[#1a1614] font-semibold text-lg">{job.name}</p>
                {job.address && <p className="text-[#7a7470] text-sm">{job.address}</p>}
                {job.trade && <p className="text-[#7a7470] text-xs mt-0.5">{job.trade}</p>}
                {job.client_name && <p className="text-[#7a7470] text-xs">Client: {job.client_name}</p>}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-1.5 bg-[#d3cec7] rounded-full">
                    <div className="h-full bg-[#f26522] rounded-full transition-all"
                      style={{ width: jobTasks.length ? `${(doneCount/jobTasks.length)*100}%` : "0%" }} />
                  </div>
                  <span className="text-[#7a7470] text-xs shrink-0">{doneCount}/{jobTasks.length}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className={`text-sm font-medium ${statusColor[job.status]}`}>{job.status}</span>
                {job.value > 0 && <span className="text-[#1a1614] font-bold">${job.value.toLocaleString()}</span>}
                <span className="text-[#7a7470]">{open ? "▲" : "▼"}</span>
              </div>
            </button>

            {open && (
              <div className="border-t border-[#d3cec7]">
                {/* Inner tabs */}
                <div className="flex overflow-x-auto border-b border-[#d3cec7]">
                  {["tasks","crew","materials","change orders","photos","selections","client","invoice"].map(t => (
                    <button key={t} onClick={() => setInnerTab(st => ({ ...st, [job.id]: t }))}
                      className={`px-4 py-3 text-xs font-semibold whitespace-nowrap capitalize transition-colors ${
                        tab === t
                          ? "text-[#f26522] border-b-2 border-[#f26522] -mb-px"
                          : "text-[#7a7470] hover:text-[#1a1614]"
                      }`}>
                      {t}
                    </button>
                  ))}
                </div>

                <div className="px-5 py-4 flex flex-col gap-3">

                  {/* ── TASKS ── */}
                  {tab === "tasks" && (
                    <>
                      {jobTasks.map(task => (
                        <div key={task.id} className={`flex items-center gap-3 rounded-xl px-4 py-3 ${task.done ? "bg-[#ede9e4]" : "bg-[#e4dfd9]"}`}>
                          <button onClick={async () => { await toggleTask(task.id, !task.done); load(); }}
                            className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors ${task.done ? "bg-[#f26522] border-[#f26522]" : "border-[#b8b2ab] hover:border-[#f26522]"}`}>
                            {task.done && <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 7L5.5 10.5L12 3.5" stroke="#f7f3ef" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                          </button>
                          <span className={`flex-1 text-sm ${task.done ? "line-through text-[#7a7470]" : "text-[#1a1614]"}`}>{task.text}</span>
                          <button onClick={async () => { await deleteTask(task.id); load(); }} className="text-[#b8b2ab] hover:text-red-400 transition-colors text-lg">×</button>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <input value={newTask[job.id] ?? ""} onChange={e => setNewTask(t => ({ ...t, [job.id]: e.target.value }))}
                          onKeyDown={e => e.key === "Enter" && handleAddTask(job.id)}
                          placeholder="Add a task..." className="flex-1 input-field" />
                        <button onClick={() => handleAddTask(job.id)}
                          className="h-11 px-5 rounded-xl bg-[#f26522] text-[#f7f3ef] font-bold hover:bg-[#d4541a] transition-colors">+</button>
                      </div>
                    </>
                  )}

                  {/* ── CREW ── */}
                  {tab === "crew" && (
                    <>
                      {(job.crew ?? []).map(member => (
                        <div key={member.id} className="flex items-center justify-between bg-[#e4dfd9] rounded-xl px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#d3cec7] flex items-center justify-center text-[#f26522] font-bold text-sm">{member.name[0]}</div>
                            <div>
                              <p className="text-[#1a1614] text-sm font-medium">{member.name}</p>
                              <p className="text-[#7a7470] text-xs">{member.role}</p>
                            </div>
                          </div>
                          <button onClick={async () => { await removeCrewFromJob(job.id, member.id); load(); }}
                            className="text-[#b8b2ab] hover:text-red-400 transition-colors text-lg">×</button>
                        </div>
                      ))}
                      <select onChange={async e => {
                        if (!e.target.value) return;
                        await assignCrewToJob(job.id, e.target.value);
                        e.target.value = ""; load();
                      }} className="input-field">
                        <option value="">+ Assign crew member</option>
                        {allCrew.filter(c => !(job.crew ?? []).find(jc => jc.id === c.id)).map(c => (
                          <option key={c.id} value={c.id}>{c.name} — {c.role}</option>
                        ))}
                      </select>
                    </>
                  )}

                  {/* ── MATERIALS ── */}
                  {tab === "materials" && (
                    <>
                      {(materials[job.id] ?? []).map(mat => (
                        <div key={mat.id} className="flex items-center gap-3 bg-[#e4dfd9] rounded-xl px-4 py-3">
                          <div className="flex-1">
                            <p className="text-[#1a1614] text-sm">{mat.name}{mat.qty ? ` — ${mat.qty}` : ""}</p>
                          </div>
                          <select value={mat.status} onChange={async e => { await updateMaterialStatus(mat.id, e.target.value as any); loadExtras(job.id); }}
                            className={`text-xs font-medium px-2 py-1 rounded-full border bg-transparent ${MATERIAL_COLORS[mat.status]}`}>
                            {MATERIAL_STATUSES.map(s => <option key={s} value={s}>{MATERIAL_LABELS[s]}</option>)}
                          </select>
                          <button onClick={async () => { await deleteMaterial(mat.id); loadExtras(job.id); }}
                            className="text-[#b8b2ab] hover:text-red-400 transition-colors text-lg">×</button>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <input value={newMaterial[job.id]?.name ?? ""} onChange={e => setNewMaterial(m => ({ ...m, [job.id]: { ...m[job.id], name: e.target.value } }))}
                          placeholder="Material name" className="flex-1 input-field" />
                        <input value={newMaterial[job.id]?.qty ?? ""} onChange={e => setNewMaterial(m => ({ ...m, [job.id]: { ...m[job.id], qty: e.target.value } }))}
                          placeholder="Qty" className="w-20 input-field" />
                        <button onClick={() => handleAddMaterial(job.id)}
                          className="h-11 px-4 rounded-xl bg-[#f26522] text-[#f7f3ef] font-bold hover:bg-[#d4541a] transition-colors">+</button>
                      </div>
                    </>
                  )}

                  {/* ── CHANGE ORDERS ── */}
                  {tab === "change orders" && (
                    <>
                      {(changeOrders[job.id] ?? []).map(co => (
                        <div key={co.id} className="bg-[#e4dfd9] rounded-xl px-4 py-3 flex items-center justify-between">
                          <div>
                            <p className="text-[#1a1614] text-sm">{co.description}</p>
                            <p className="text-[#7a7470] text-xs">${co.amount.toLocaleString()}</p>
                          </div>
                          <span className={`text-xs font-medium px-2 py-1 rounded-full border ${
                            co.status === "approved" ? "text-emerald-400 border-emerald-800/40" :
                            co.status === "declined" ? "text-red-400 border-red-900/40" :
                            "text-[#f26522] border-[#f26522]/40"
                          }`}>{co.status}</span>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <input value={newCO[job.id]?.desc ?? ""} onChange={e => setNewCO(c => ({ ...c, [job.id]: { ...c[job.id], desc: e.target.value } }))}
                          placeholder="Describe the change" className="flex-1 input-field" />
                        <input value={newCO[job.id]?.amount ?? ""} onChange={e => setNewCO(c => ({ ...c, [job.id]: { ...c[job.id], amount: e.target.value } }))}
                          placeholder="$" type="number" className="w-24 input-field" />
                        <button onClick={() => handleAddCO(job.id)}
                          className="h-11 px-4 rounded-xl bg-[#f26522] text-[#f7f3ef] font-bold hover:bg-[#d4541a] transition-colors">Send</button>
                      </div>
                      <p className="text-[#7a7470] text-xs">Change orders appear on the client's preview link for approval.</p>
                    </>
                  )}

                  {/* ── PHOTOS ── */}
                  {tab === "photos" && (
                    <>
                      {(photos[job.id] ?? []).length === 0 && (
                        <p className="text-[#7a7470] text-sm text-center py-4">No photos yet.</p>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        {(photos[job.id] ?? []).map(photo => (
                          <div key={photo.id} className="relative rounded-xl overflow-hidden bg-[#e4dfd9] group">
                            <img src={photo.url} alt={photo.caption ?? ""} className="w-full h-32 object-cover" />
                            {photo.caption && <p className="text-[#7a7470] text-xs px-2 py-1">{photo.caption}</p>}
                            <button onClick={async () => { await deletePhoto(photo.id, photo.url); loadExtras(job.id); }}
                              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/70 text-white text-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                          </div>
                        ))}
                      </div>
                      <label className="flex items-center justify-center h-11 rounded-xl border border-dashed border-[#b8b2ab] text-[#7a7470] text-sm cursor-pointer hover:border-[#f26522] hover:text-[#f26522] transition-colors">
                        📷 Upload Photo
                        <input type="file" accept="image/*" className="hidden" onChange={e => handlePhotoUpload(job.id, e)} />
                      </label>
                    </>
                  )}

                  {/* ── SELECTIONS ── */}
                  {tab === "selections" && (() => {
                    const CATEGORIES = ["Cabinet Style","Finish","Hardware","Crown Molding","Flooring","Lighting","Other"];
                    const jobSels = selections[job.id] ?? [];
                    const grouped = CATEGORIES.reduce((acc, cat) => {
                      const items = jobSels.filter(s => s.category === cat);
                      if (items.length) acc[cat] = items;
                      return acc;
                    }, {} as Record<string, Selection[]>);
                    return (
                      <>
                        <div className="flex gap-2">
                          <select
                            value={selCategory[job.id] ?? "Cabinet Style"}
                            onChange={e => setSelCategory(s => ({ ...s, [job.id]: e.target.value }))}
                            className="flex-1 input-field text-sm">
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                          <label className="flex items-center justify-center px-4 h-11 rounded-xl border border-dashed border-[#b8b2ab] text-[#7a7470] text-sm cursor-pointer hover:border-[#f26522] hover:text-[#f26522] transition-colors whitespace-nowrap">
                            + Add Image
                            <input type="file" accept="image/*" className="hidden" onChange={e => handleSelectionUpload(job.id, e)} />
                          </label>
                        </div>
                        {jobSels.length === 0 && (
                          <p className="text-[#7a7470] text-sm text-center py-4">No selections yet. Pick a category and upload reference images for the client.</p>
                        )}
                        {Object.entries(grouped).map(([cat, items]) => (
                          <div key={cat} className="flex flex-col gap-2">
                            <p className="text-[#7a7470] text-xs font-semibold uppercase tracking-widest">{cat}</p>
                            <div className="grid grid-cols-2 gap-2">
                              {items.map(sel => (
                                <div key={sel.id} className="relative rounded-xl overflow-hidden bg-[#e4dfd9] group">
                                  <img src={sel.url} alt={sel.label ?? cat} className="w-full h-32 object-cover" />
                                  {sel.label && <p className="text-[#7a7470] text-xs px-2 py-1 font-medium">{sel.label}</p>}
                                  <button onClick={async () => { await deleteSelection(sel.id, sel.url); loadExtras(job.id); }}
                                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white text-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                        <p className="text-[#7a7470] text-xs">These images appear in the client's preview link under the Selections tab.</p>
                      </>
                    );
                  })()}

                  {/* ── CLIENT ── */}
                  {tab === "client" && (
                    <>
                      <div className="flex gap-2">
                        <button onClick={() => copyLink("client", job.id)}
                          className="flex-1 h-10 rounded-xl border border-[#d3cec7] text-[#7a7470] text-xs font-medium hover:border-[#f26522] hover:text-[#f26522] transition-colors">
                          {clientLinkCopied === job.id ? "✓ Copied!" : "Copy Client Preview Link"}
                        </button>
                        <button onClick={() => copyLink("sub", job.id)}
                          className="flex-1 h-10 rounded-xl border border-[#d3cec7] text-[#7a7470] text-xs font-medium hover:border-[#f26522] hover:text-[#f26522] transition-colors">
                          {subLinkCopied === job.id ? "✓ Copied!" : "Copy Contractor Link"}
                        </button>
                      </div>
                      <textarea value={updateMsg[job.id] ?? ""} onChange={e => setUpdateMsg(m => ({ ...m, [job.id]: e.target.value }))}
                        placeholder="Send a message or update to the client..." rows={3}
                        className="input-field resize-none" />
                      <button onClick={() => sendClientUpdate(job.id)}
                        disabled={!updateMsg[job.id]?.trim()}
                        className="h-11 rounded-xl bg-[#f26522] text-[#f7f3ef] font-bold hover:bg-[#d4541a] transition-colors disabled:opacity-40">
                        Send to Client
                      </button>
                    </>
                  )}

                  {/* ── INVOICE ── */}
                  {tab === "invoice" && (
                    <>
                      {(invoices[job.id] ?? []).length === 0 ? (
                        <div className="flex flex-col items-center gap-3 py-4">
                          <p className="text-[#7a7470] text-sm text-center">No invoice yet. Generate one from the job's financials.</p>
                          <button onClick={() => handleGenInvoice(job.id)}
                            className="px-6 h-11 rounded-xl bg-[#f26522] text-[#f7f3ef] font-bold hover:bg-[#d4541a] transition-colors">
                            Generate Invoice
                          </button>
                        </div>
                      ) : (invoices[job.id] ?? []).map(inv => (
                        <div key={inv.id} className="bg-[#e4dfd9] rounded-xl p-4 flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <p className="text-[#1a1614] font-bold text-lg">${inv.amount.toLocaleString()}</p>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full border ${
                              inv.status === "paid" ? "text-emerald-400 border-emerald-800/40" :
                              inv.status === "sent" ? "text-[#f26522] border-[#f26522]/40" :
                              "text-[#7a7470] border-[#d3cec7]"
                            }`}>{inv.status}</span>
                          </div>
                          {(inv.line_items ?? []).map((li: any, i: number) => (
                            <div key={i} className="flex justify-between text-sm">
                              <span className="text-[#7a7470]">{li.description}</span>
                              <span className="text-[#1a1614]">${li.amount?.toLocaleString()}</span>
                            </div>
                          ))}
                          <div className="flex gap-2">
                            {inv.status === "draft" && (
                              <button onClick={async () => { await updateInvoiceStatus(inv.id, "sent"); loadExtras(job.id); }}
                                className="flex-1 h-10 rounded-xl bg-[#f26522] text-[#f7f3ef] font-bold text-sm hover:bg-[#d4541a] transition-colors">
                                Mark Sent
                              </button>
                            )}
                            {inv.status === "sent" && (
                              <button onClick={async () => { await updateInvoiceStatus(inv.id, "paid"); loadExtras(job.id); }}
                                className="flex-1 h-10 rounded-xl bg-emerald-800/40 text-emerald-400 font-bold text-sm hover:bg-emerald-800/60 transition-colors">
                                Mark Paid
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </>
                  )}

                  {/* Bottom actions */}
                  <div className="flex gap-2 pt-2 border-t border-[#d3cec7]">
                    <button onClick={() => { setEditingJob(job); setForm({ name: job.name, address: job.address ?? "", trade: job.trade ?? "", status: job.status, client_name: job.client_name ?? "", client_email: job.client_email ?? "", value: String(job.value) }); setShowNewForm(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      className="flex-1 h-9 rounded-lg border border-[#d3cec7] text-[#7a7470] text-xs hover:border-[#f26522] hover:text-[#f26522] transition-colors">
                      Edit Job
                    </button>
                    <button onClick={() => handleDeleteJob(job.id)}
                      className="h-9 px-4 rounded-lg border border-red-900/40 text-red-400 text-xs hover:bg-red-950/20 transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <style jsx global>{`
        .input-field { background:#e4dfd9; border:1px solid #d3cec7; border-radius:12px; padding:10px 14px; color:#1a1614; font-size:14px; width:100%; outline:none; transition:border-color 0.2s; }
        .input-field:focus { border-color:#f26522; }
        .input-field option { background:#e4dfd9; }
        .input-field::placeholder { color:#b8b2ab; }
      `}</style>
    </div>
  );
}
