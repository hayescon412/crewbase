"use client";

import { useState, useEffect } from "react";
import { getAdmins, createAdmin, deleteAdmin } from "@/lib/db";
import type { Admin } from "@/lib/types";

export default function AdminsTab({ currentAdminId }: { currentAdminId: string }) {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", pin: "", role: "admin" as "admin" | "manager" });
  const [pinError, setPinError] = useState("");

  async function load() { setAdmins(await getAdmins()); setLoading(false); }
  useEffect(() => { load(); }, []);

  async function handleAdd() {
    if (!form.name.trim()) return;
    if (!/^\d{4}$/.test(form.pin)) { setPinError("PIN must be exactly 4 digits."); return; }
    setPinError("");
    await createAdmin(form.name.trim(), form.pin, form.role);
    setForm({ name: "", pin: "", role: "admin" }); setShowForm(false); load();
  }

  async function handleDelete(id: string) {
    if (id === currentAdminId) { alert("You can't delete yourself."); return; }
    if (admins.length === 1) { alert("Can't delete the only admin."); return; }
    if (!confirm("Remove this admin?")) return;
    await deleteAdmin(id); load();
  }

  return (
    <div className="flex flex-col gap-4">
      {!showForm && (
        <button onClick={() => setShowForm(true)}
          className="flex items-center justify-center h-12 rounded-xl border border-dashed border-[#b8b2ab] text-[#7a7470] hover:border-[#f26522] hover:text-[#f26522] transition-colors">
          + Add Admin / Manager
        </button>
      )}

      {showForm && (
        <div className="bg-[#ede9e4] border border-[#f26522]/30 rounded-2xl p-5 flex flex-col gap-4">
          <p className="text-[#f26522] font-semibold">New Admin</p>
          <div className="grid grid-cols-2 gap-3">
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Name *" className="input-field" />
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as any }))} className="input-field">
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
            </select>
            <div className="col-span-2 flex flex-col gap-1">
              <input value={form.pin} onChange={e => setForm(f => ({ ...f, pin: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                placeholder="4-digit PIN *" type="password" maxLength={4} className="input-field" />
              {pinError && <p className="text-red-400 text-xs px-1">{pinError}</p>}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="flex-1 h-11 rounded-xl bg-[#f26522] text-[#f7f3ef] font-bold hover:bg-[#d4541a] transition-colors">Add</button>
            <button onClick={() => setShowForm(false)} className="h-11 px-5 rounded-xl border border-[#d3cec7] text-[#7a7470] hover:text-[#1a1614] transition-colors">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-[#ede9e4] border border-[#d3cec7] rounded-2xl overflow-hidden">
        {loading ? <p className="text-[#7a7470] text-sm text-center py-8">Loading...</p> : (
          <div className="divide-y divide-[#d3cec7]">
            {admins.map(admin => (
              <div key={admin.id} className="flex items-center justify-between px-5 py-4 hover:bg-[#e7e3de] group transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#d3cec7] flex items-center justify-center text-[#f26522] font-bold shrink-0">
                    {admin.name[0]}
                  </div>
                  <div>
                    <p className="text-[#1a1614] font-medium">{admin.name} {admin.id === currentAdminId && <span className="text-[#7a7470] text-xs">(you)</span>}</p>
                    <p className="text-[#7a7470] text-sm capitalize">{admin.role}</p>
                  </div>
                </div>
                {admin.id !== currentAdminId && (
                  <button onClick={() => handleDelete(admin.id)}
                    className="text-red-400 text-xs border border-red-900/40 px-3 py-1.5 rounded-lg hover:bg-red-950/20 transition-colors opacity-0 group-hover:opacity-100 transition-opacity">
                    Remove
                  </button>
                )}
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
