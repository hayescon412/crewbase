"use client";

import { useState, useEffect } from "react";
import { getSubProfiles, createSubProfile, updateSubProfile, deleteSubProfile } from "@/lib/db";
import type { SubProfile } from "@/lib/types";

const AVAILABILITY_COLORS: Record<SubProfile["availability"], string> = {
  available: "text-emerald-400 border-emerald-800/40",
  busy: "text-[#f26522] border-[#f26522]/40",
  unavailable: "text-[#7a7470] border-[#d3cec7]",
};

export default function SubsTab() {
  const [subs, setSubs] = useState<SubProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<SubProfile | null>(null);
  const [showForm, setShowForm] = useState(false);
  const blank = { name: "", trade: "", phone: "", email: "", bio: "", availability: "available" as const };
  const [form, setForm] = useState(blank);

  async function load() { setSubs(await getSubProfiles()); setLoading(false); }
  useEffect(() => { load(); }, []);

  async function handleSave() {
    if (!form.name.trim()) return;
    if (editing) { await updateSubProfile(editing.id, form); }
    else { await createSubProfile(form); }
    setForm(blank); setEditing(null); setShowForm(false); load();
  }

  function startEdit(sub: SubProfile) {
    setEditing(sub);
    setForm({ name: sub.name, trade: sub.trade ?? "", phone: sub.phone ?? "", email: sub.email ?? "", bio: sub.bio ?? "", availability: sub.availability });
    setShowForm(true);
  }

  return (
    <div className="flex flex-col gap-4">
      {!showForm && (
        <button onClick={() => { setShowForm(true); setEditing(null); setForm(blank); }}
          className="flex items-center justify-center h-12 rounded-xl border border-dashed border-[#b8b2ab] text-[#7a7470] hover:border-[#f26522] hover:text-[#f26522] transition-colors">
          + Add Subcontractor Profile
        </button>
      )}

      {showForm && (
        <div className="bg-[#ede9e4] border border-[#f26522]/30 rounded-2xl p-5 flex flex-col gap-4">
          <p className="text-[#f26522] font-semibold">{editing ? "Edit Profile" : "New Sub Profile"}</p>
          <div className="grid grid-cols-2 gap-3">
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Name *" className="col-span-2 input-field" />
            <input value={form.trade} onChange={e => setForm(f => ({ ...f, trade: e.target.value }))} placeholder="Trade" className="input-field" />
            <select value={form.availability} onChange={e => setForm(f => ({ ...f, availability: e.target.value as any }))} className="input-field">
              <option value="available">Available</option>
              <option value="busy">Busy</option>
              <option value="unavailable">Unavailable</option>
            </select>
            <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Phone" className="input-field" />
            <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email" className="input-field" />
            <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Notes / bio" rows={2} className="col-span-2 input-field resize-none" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} className="flex-1 h-11 rounded-xl bg-[#f26522] text-[#f7f3ef] font-bold hover:bg-[#d4541a] transition-colors">
              {editing ? "Save Changes" : "Add Sub"}
            </button>
            <button onClick={() => { setShowForm(false); setEditing(null); setForm(blank); }} className="h-11 px-5 rounded-xl border border-[#d3cec7] text-[#7a7470] hover:text-[#1a1614] transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-[#ede9e4] border border-[#d3cec7] rounded-2xl overflow-hidden">
        {loading ? <p className="text-[#7a7470] text-sm text-center py-8">Loading...</p> :
          subs.length === 0 ? <p className="text-[#7a7470] text-sm text-center py-8">No subcontractor profiles yet.</p> : (
            <div className="divide-y divide-[#d3cec7]">
              {subs.map(sub => (
                <div key={sub.id} className="flex items-center justify-between px-5 py-4 hover:bg-[#e7e3de] group transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#d3cec7] flex items-center justify-center text-[#f26522] font-bold shrink-0">
                      {sub.name[0]}
                    </div>
                    <div>
                      <p className="text-[#1a1614] font-medium">{sub.name}</p>
                      {sub.trade && <p className="text-[#7a7470] text-sm">{sub.trade}</p>}
                      {sub.phone && <p className="text-[#7a7470] text-xs">{sub.phone}</p>}
                      {sub.bio && <p className="text-[#7a7470] text-xs mt-0.5 max-w-xs truncate">{sub.bio}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <select value={sub.availability} onChange={async e => { await updateSubProfile(sub.id, { availability: e.target.value as any }); load(); }}
                      className={`text-xs font-medium px-2 py-1 rounded-full border bg-transparent ${AVAILABILITY_COLORS[sub.availability]}`}>
                      <option value="available">Available</option>
                      <option value="busy">Busy</option>
                      <option value="unavailable">Unavailable</option>
                    </select>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEdit(sub)} className="text-[#7a7470] text-xs hover:text-[#f26522] border border-[#d3cec7] px-3 py-1.5 rounded-lg transition-colors">Edit</button>
                      <button onClick={async () => { if (!confirm("Delete this profile?")) return; await deleteSubProfile(sub.id); load(); }}
                        className="text-red-400 text-xs border border-red-900/40 px-3 py-1.5 rounded-lg hover:bg-red-950/20 transition-colors">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>

      <style jsx global>{`
        .input-field{background:#e4dfd9;border:1px solid #d3cec7;border-radius:12px;padding:10px 14px;color:#1a1614;font-size:14px;width:100%;outline:none;transition:border-color 0.2s;}
        .input-field:focus{border-color:#f26522;}
        .input-field option{background:#e4dfd9;}
        .input-field::placeholder{color:#b8b2ab;}
      `}</style>
    </div>
  );
}
