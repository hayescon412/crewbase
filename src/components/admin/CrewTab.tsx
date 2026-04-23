"use client";

import { useState, useEffect } from "react";
import { getCrew, createCrewMember, updateCrewMember, deleteCrewMember } from "@/lib/db";
import type { CrewMember } from "@/lib/types";

export default function CrewTab() {
  const [crew, setCrew] = useState<CrewMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<CrewMember | null>(null);
  const [showForm, setShowForm] = useState(false);
  const blank = { name: "", role: "", phone: "", email: "" };
  const [form, setForm] = useState(blank);

  async function load() {
    setCrew(await getCrew()); setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function handleSave() {
    if (!form.name.trim()) return;
    if (editing) {
      await updateCrewMember(editing.id, form);
    } else {
      await createCrewMember(form);
    }
    setForm(blank); setEditing(null); setShowForm(false); load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this crew member?")) return;
    await deleteCrewMember(id); load();
  }

  function startEdit(member: CrewMember) {
    setEditing(member);
    setForm({ name: member.name, role: member.role ?? "", phone: member.phone ?? "", email: member.email ?? "" });
    setShowForm(true);
  }

  return (
    <div className="flex flex-col gap-4">
      {!showForm && (
        <button onClick={() => { setShowForm(true); setEditing(null); setForm(blank); }}
          className="flex items-center justify-center h-12 rounded-xl border border-dashed border-[#b8b2ab] text-[#7a7470] hover:border-[#f26522] hover:text-[#f26522] transition-colors">
          + Add Crew Member
        </button>
      )}

      {showForm && (
        <div className="bg-[#ede9e4] border border-[#f26522]/30 rounded-2xl p-5 flex flex-col gap-4">
          <p className="text-[#f26522] font-semibold">{editing ? "Edit Member" : "New Crew Member"}</p>
          <div className="grid grid-cols-2 gap-3">
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Full name *" className="col-span-2 input-field" />
            <input value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              placeholder="Role (e.g. Carpenter)" className="input-field" />
            <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="Phone" className="input-field" />
            <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="Email" type="email" className="col-span-2 input-field" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave}
              className="flex-1 h-11 rounded-xl bg-[#f26522] text-[#f7f3ef] font-bold hover:bg-[#d4541a] transition-colors">
              {editing ? "Save Changes" : "Add Member"}
            </button>
            <button onClick={() => { setShowForm(false); setEditing(null); setForm(blank); }}
              className="h-11 px-5 rounded-xl border border-[#d3cec7] text-[#7a7470] hover:text-[#1a1614] transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-[#ede9e4] border border-[#d3cec7] rounded-2xl overflow-hidden">
        {loading ? (
          <p className="text-[#7a7470] text-sm text-center py-8">Loading...</p>
        ) : crew.length === 0 ? (
          <p className="text-[#7a7470] text-sm text-center py-8">No crew members yet.</p>
        ) : (
          <div className="divide-y divide-[#d3cec7]">
            {crew.map(member => (
              <div key={member.id} className="flex items-center justify-between px-5 py-4 hover:bg-[#e7e3de] group transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#d3cec7] flex items-center justify-center text-[#f26522] font-bold shrink-0">
                    {member.name[0]}
                  </div>
                  <div>
                    <p className="text-[#1a1614] font-medium">{member.name}</p>
                    <p className="text-[#7a7470] text-sm">{member.role}</p>
                    {member.phone && <p className="text-[#7a7470] text-xs">{member.phone}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEdit(member)}
                    className="text-[#7a7470] text-xs hover:text-[#f26522] border border-[#d3cec7] px-3 py-1.5 rounded-lg transition-colors">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(member.id)}
                    className="text-red-400 text-xs border border-red-900/40 px-3 py-1.5 rounded-lg hover:bg-red-950/20 transition-colors">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx global>{`
        .input-field{background:#e4dfd9;border:1px solid #d3cec7;border-radius:12px;padding:10px 14px;color:#1a1614;font-size:14px;width:100%;outline:none;transition:border-color 0.2s;}
        .input-field:focus{border-color:#f26522;}
        .input-field::placeholder{color:#b8b2ab;}
      `}</style>
    </div>
  );
}
