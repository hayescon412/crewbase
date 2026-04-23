"use client";

import { useState, useEffect, useRef } from "react";
import { getAdmins, verifyAdminPin, createAdmin, deleteAdmin } from "@/lib/db";
import type { Admin } from "@/lib/types";
import AdminDashboard from "@/components/admin/AdminDashboard";

// ── PIN GATE ──────────────────────────────────────────────────

function PinGate({ onUnlock }: { onUnlock: (admin: Admin) => void }) {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [selected, setSelected] = useState<Admin | null>(null);
  const [digits, setDigits] = useState<string[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdmins().then((a) => { setAdmins(a); setLoading(false); });
  }, []);

  async function pressDigit(d: string) {
    if (!selected || digits.length >= 4) return;
    const next = [...digits, d];
    setDigits(next);
    setError(false);
    if (next.length === 4) {
      const admin = await verifyAdminPin(selected.name, next.join(""));
      if (admin) {
        sessionStorage.setItem("adminId", admin.id);
        sessionStorage.setItem("adminName", admin.name);
        onUnlock(admin);
      } else {
        setTimeout(() => { setDigits([]); setError(true); }, 400);
      }
    }
  }

  const keys = ["1","2","3","4","5","6","7","8","9","","0","⌫"];

  if (loading) return (
    <div className="flex flex-1 items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-[#f26522] border-t-transparent animate-spin" />
    </div>
  );

  // Step 1 — pick who you are
  if (!selected) return (
    <div className="flex flex-col flex-1 items-center justify-center px-6">
      <div className="w-full max-w-xs flex flex-col gap-6">
        <div className="text-center">
          <p className="text-[#f26522] font-bold text-lg">Admin Access</p>
          <p className="text-[#7a7470] text-sm mt-1">Who are you?</p>
        </div>
        <div className="flex flex-col gap-3">
          {admins.map((a) => (
            <button key={a.id} onClick={() => setSelected(a)}
              className="flex items-center gap-4 h-16 px-5 rounded-2xl bg-[#ede9e4] border border-[#d3cec7] hover:border-[#f26522] transition-colors text-left">
              <div className="w-10 h-10 rounded-full bg-[#d3cec7] flex items-center justify-center text-[#f26522] font-bold">
                {a.name[0]}
              </div>
              <div>
                <p className="text-[#1a1614] font-semibold text-lg">{a.name}</p>
                <p className="text-[#7a7470] text-sm capitalize">{a.role}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Step 2 — enter PIN
  return (
    <div className="flex flex-col flex-1 items-center justify-center px-6">
      <div className="bg-[#ede9e4] border border-[#d3cec7] rounded-2xl p-8 flex flex-col items-center gap-6 w-full max-w-xs">
        <div className="text-center">
          <p className="text-[#f26522] font-bold text-lg">{selected.name}</p>
          <p className="text-[#7a7470] text-sm">Enter your 4-digit PIN</p>
        </div>
        <div className="flex gap-4">
          {[0,1,2,3].map((i) => (
            <div key={i} className={`w-4 h-4 rounded-full border-2 transition-colors ${
              i < digits.length
                ? error ? "bg-red-500 border-red-500" : "bg-[#f26522] border-[#f26522]"
                : "border-[#d3cec7]"
            }`} />
          ))}
        </div>
        {error && <p className="text-red-400 text-sm font-medium">Incorrect PIN</p>}
        <div className="grid grid-cols-3 gap-3 w-full">
          {keys.map((key, idx) => {
            if (key === "") return <div key={idx} />;
            return (
              <button key={idx} onClick={() => key === "⌫"
                ? setDigits(p => p.slice(0,-1))
                : pressDigit(key)
              }
                className="h-16 rounded-xl bg-[#e4dfd9] border border-[#d3cec7] text-[#1a1614] text-xl font-semibold hover:border-[#f26522] transition-colors active:scale-95">
                {key}
              </button>
            );
          })}
        </div>
        <button onClick={() => { setSelected(null); setDigits([]); setError(false); }}
          className="text-[#7a7470] text-sm hover:text-[#1a1614] transition-colors">
          ← Back
        </button>
      </div>
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────────

export default function AdminPage() {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const id = sessionStorage.getItem("adminId");
    const name = sessionStorage.getItem("adminName");
    if (id && name) setAdmin({ id, name } as Admin);
    setChecked(true);
  }, []);

  function lock() {
    sessionStorage.removeItem("adminId");
    sessionStorage.removeItem("adminName");
    setAdmin(null);
  }

  if (!checked || !admin) {
    return <PinGate onUnlock={(a) => setAdmin(a)} />;
  }

  return <AdminDashboard admin={admin} onLock={lock} />;
}
