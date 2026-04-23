"use client";

import { useState, useEffect } from "react";
import { getTransactions, createTransaction, deleteTransaction, getJobs } from "@/lib/db";
import type { Transaction, Job } from "@/lib/types";

const CATEGORIES = ["Client Payment", "Labor", "Materials", "Equipment", "Subcontractor", "Overhead", "Other"];

const CATEGORY_COLORS: Record<string, string> = {
  "Client Payment": "#10b981",
  "Labor": "#f26522",
  "Materials": "#3b82f6",
  "Equipment": "#8b5cf6",
  "Subcontractor": "#ec4899",
  "Overhead": "#f59e0b",
  "Other": "#7a7470",
};

function fmt(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function getLast6Months() {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleDateString("en-US", { month: "short" }),
    });
  }
  return months;
}

export default function FinancialsTab() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    description: "", amount: "", type: "income" as "income" | "expense",
    category: "Client Payment", job_id: "", date: new Date().toISOString().split("T")[0],
  });

  async function load() {
    const [txs, js] = await Promise.all([getTransactions(), getJobs()]);
    setTransactions(txs); setJobs(js); setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function handleAdd() {
    if (!form.description || !form.amount) return;
    await createTransaction({
      description: form.description,
      amount: parseFloat(form.amount),
      type: form.type,
      category: form.category,
      job_id: form.job_id || null,
      date: form.date,
    });
    setForm({ description: "", amount: "", type: "income", category: "Client Payment", job_id: "", date: new Date().toISOString().split("T")[0] });
    setShowForm(false);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this transaction?")) return;
    await deleteTransaction(id);
    load();
  }

  const income = transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const net = income - expenses;

  // 6-month breakdown
  const months = getLast6Months();
  const monthlyData = months.map(m => {
    const txs = transactions.filter(t => t.date?.startsWith(m.key));
    return {
      ...m,
      income: txs.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0),
      expenses: txs.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0),
    };
  });
  const maxBar = Math.max(...monthlyData.flatMap(m => [m.income, m.expenses]), 1);

  // Expense breakdown by category
  const expenseTxs = transactions.filter(t => t.type === "expense");
  const totalExp = expenseTxs.reduce((s, t) => s + t.amount, 0);
  const byCategory = CATEGORIES.map(cat => ({
    cat,
    amount: expenseTxs.filter(t => t.category === cat).reduce((s, t) => s + t.amount, 0),
  })).filter(c => c.amount > 0).sort((a, b) => b.amount - a.amount);

  return (
    <div className="flex flex-col gap-6">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Revenue", value: fmt(income), color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
          { label: "Total Expenses", value: fmt(expenses), color: "text-red-500", bg: "bg-red-50 border-red-200" },
          { label: "Net Profit", value: fmt(net), color: net >= 0 ? "text-emerald-600" : "text-red-500", bg: net >= 0 ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200" },
        ].map(c => (
          <div key={c.label} className={`${c.bg} border rounded-2xl p-5`}>
            <p className="text-[#7a7470] text-xs font-medium uppercase tracking-wide">{c.label}</p>
            <p className={`text-2xl font-bold mt-1 ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* 6-Month P&L Chart */}
      <div className="bg-[#ede9e4] border border-[#d3cec7] rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-[#1a1614] font-semibold">6-Month P&L</p>
          <div className="flex items-center gap-4 text-xs text-[#7a7470]">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />Revenue</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#f26522] inline-block" />Expenses</span>
          </div>
        </div>
        <div className="flex items-end gap-2 h-40">
          {monthlyData.map(m => (
            <div key={m.key} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex items-end gap-0.5 h-32">
                <div className="flex-1 bg-emerald-500 rounded-t-md transition-all duration-500 min-h-[2px]"
                  style={{ height: `${(m.income / maxBar) * 100}%` }} title={fmt(m.income)} />
                <div className="flex-1 bg-[#f26522] rounded-t-md transition-all duration-500 min-h-[2px]"
                  style={{ height: `${(m.expenses / maxBar) * 100}%` }} title={fmt(m.expenses)} />
              </div>
              <p className="text-[#7a7470] text-xs font-medium">{m.label}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-6 gap-2 pt-2 border-t border-[#d3cec7]">
          {monthlyData.map(m => (
            <div key={m.key} className="flex flex-col gap-0.5 text-center">
              <p className="text-emerald-600 text-xs font-semibold">{m.income > 0 ? fmt(m.income) : "—"}</p>
              <p className="text-red-500 text-xs">{m.expenses > 0 ? fmt(m.expenses) : "—"}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Expense Breakdown */}
      {byCategory.length > 0 && (
        <div className="bg-[#ede9e4] border border-[#d3cec7] rounded-2xl p-5 flex flex-col gap-3">
          <p className="text-[#1a1614] font-semibold">Expense Breakdown</p>
          {byCategory.map(({ cat, amount }) => (
            <div key={cat} className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: CATEGORY_COLORS[cat] ?? "#7a7470" }} />
                  <span className="text-[#1a1614] text-sm">{cat}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[#7a7470] text-xs">{totalExp > 0 ? Math.round((amount / totalExp) * 100) : 0}%</span>
                  <span className="text-[#1a1614] text-sm font-semibold">{fmt(amount)}</span>
                </div>
              </div>
              <div className="h-1.5 bg-[#d3cec7] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${totalExp > 0 ? (amount / totalExp) * 100 : 0}%`, background: CATEGORY_COLORS[cat] ?? "#7a7470" }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add transaction */}
      {!showForm ? (
        <button onClick={() => setShowForm(true)}
          className="flex items-center justify-center h-12 rounded-xl border border-dashed border-[#b8b2ab] text-[#7a7470] hover:border-[#f26522] hover:text-[#f26522] transition-colors">
          + Add Transaction
        </button>
      ) : (
        <div className="bg-[#ede9e4] border border-[#f26522]/30 rounded-2xl p-5 flex flex-col gap-4">
          <p className="text-[#f26522] font-semibold">New Transaction</p>
          <div className="grid grid-cols-2 gap-3">
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Description" className="col-span-2 input-field" />
            <input value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              placeholder="Amount" type="number" min="0" step="0.01" className="input-field" />
            <input value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              type="date" className="input-field" />
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as any }))}
              className="input-field">
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="input-field">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={form.job_id} onChange={e => setForm(f => ({ ...f, job_id: e.target.value }))}
              className="col-span-2 input-field">
              <option value="">No job linked</option>
              {jobs.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd}
              className="flex-1 h-11 rounded-xl bg-[#f26522] text-[#f7f3ef] font-bold hover:bg-[#d4541a] transition-colors">
              Save
            </button>
            <button onClick={() => setShowForm(false)}
              className="h-11 px-5 rounded-xl border border-[#d3cec7] text-[#7a7470] hover:text-[#1a1614] transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Transaction list */}
      <div className="bg-[#ede9e4] border border-[#d3cec7] rounded-2xl overflow-hidden">
        <p className="text-[#7a7470] text-sm font-semibold px-5 py-4 border-b border-[#d3cec7] uppercase tracking-wide">All Transactions</p>
        {loading ? (
          <p className="text-[#7a7470] text-sm px-5 py-8 text-center">Loading...</p>
        ) : transactions.length === 0 ? (
          <p className="text-[#7a7470] text-sm px-5 py-8 text-center">No transactions yet.</p>
        ) : (
          <div className="divide-y divide-[#d3cec7]">
            {transactions.map(tx => (
              <div key={tx.id} className="flex items-center justify-between px-5 py-4 hover:bg-[#e7e3de] group transition-colors">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: CATEGORY_COLORS[tx.category ?? ""] ?? "#7a7470" }} />
                  <div>
                    <p className="text-[#1a1614] font-medium text-sm">{tx.description}</p>
                    <p className="text-[#7a7470] text-xs mt-0.5">
                      {tx.category} · {tx.date}
                      {(tx as any).job?.name && ` · ${(tx as any).job.name}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`font-bold ${tx.type === "income" ? "text-emerald-600" : "text-red-500"}`}>
                    {tx.type === "income" ? "+" : "-"}{fmt(tx.amount)}
                  </span>
                  <button onClick={() => handleDelete(tx.id)}
                    className="text-[#b8b2ab] hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-xl">×</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx global>{`
        .input-field {
          background: #e4dfd9;
          border: 1px solid #d3cec7;
          border-radius: 12px;
          padding: 10px 14px;
          color: #1a1614;
          font-size: 14px;
          width: 100%;
          outline: none;
          transition: border-color 0.2s;
        }
        .input-field:focus { border-color: #f26522; }
        .input-field option { background: #e4dfd9; }
        .input-field::placeholder { color: #b8b2ab; }
      `}</style>
    </div>
  );
}
