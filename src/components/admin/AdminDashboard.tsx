"use client";

import { useState } from "react";
import type { Admin } from "@/lib/types";
import FinancialsTab from "./FinancialsTab";
import JobsTab from "./JobsTab";
import CrewTab from "./CrewTab";
import FlagsTab from "./FlagsTab";
import ScheduleTab from "./ScheduleTab";
import SubsTab from "./SubsTab";
import AdminsTab from "./AdminsTab";

type Tab = "financials" | "jobs" | "crew" | "flags" | "schedule" | "subs" | "admins";

const tabs: { key: Tab; label: string }[] = [
  { key: "financials", label: "Financials" },
  { key: "jobs", label: "Jobs" },
  { key: "crew", label: "Crew" },
  { key: "schedule", label: "Schedule" },
  { key: "flags", label: "Flags" },
  { key: "subs", label: "Subs" },
  { key: "admins", label: "Admins" },
];

export default function AdminDashboard({ admin, onLock }: { admin: Admin; onLock: () => void }) {
  const [tab, setTab] = useState<Tab>("financials");

  return (
    <div className="flex flex-col flex-1 max-w-5xl mx-auto w-full px-4 py-8 gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-[#1a1614]">Admin</h2>
          <p className="text-[#7a7470] text-sm mt-0.5">Logged in as {admin.name}</p>
        </div>
        <button onClick={onLock}
          className="text-[#7a7470] text-sm border border-[#d3cec7] px-4 py-2 rounded-lg hover:border-[#7a7470] hover:text-[#1a1614] transition-colors">
          Lock
        </button>
      </div>

      {/* Tab bar — scrollable on mobile */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${
              tab === t.key
                ? "bg-[#f26522] text-[#f7f3ef]"
                : "bg-[#ede9e4] border border-[#d3cec7] text-[#7a7470] hover:text-[#1a1614]"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "financials" && <FinancialsTab />}
      {tab === "jobs"       && <JobsTab />}
      {tab === "crew"       && <CrewTab />}
      {tab === "schedule"   && <ScheduleTab />}
      {tab === "flags"      && <FlagsTab />}
      {tab === "subs"       && <SubsTab />}
      {tab === "admins"     && <AdminsTab currentAdminId={admin.id} />}
    </div>
  );
}
