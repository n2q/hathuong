"use client";
import { useEffect, useState, useCallback } from "react";
import Header from "@/components/layout/Header";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { Plus, Pencil, Trash2, Search, Fuel, UtensilsCrossed, Wrench, Car, Tag, Receipt } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Expense {
  id: string; title: string; amount: string; category: string; date: string; notes: string | null;
}

const CATEGORIES = [
  { value: "xang_dau", label: "Xăng/dầu", icon: Fuel, color: "bg-orange-100 text-orange-700" },
  { value: "an_uong", label: "Ăn uống", icon: UtensilsCrossed, color: "bg-yellow-100 text-yellow-700" },
  { value: "di_chuyen", label: "Di chuyển", icon: Car, color: "bg-blue-100 text-blue-700" },
  { value: "cong_cu", label: "Dụng cụ", icon: Wrench, color: "bg-purple-100 text-purple-700" },
  { value: "khac", label: "Khác", icon: Tag, color: "bg-gray-100 text-gray-700" },
];

function getCat(value: string) {
  return CATEGORIES.find((c) => c.value === value) ?? CATEGORIES[CATEGORIES.length - 1];
}

const emptyForm = {
  title: "", amount: "", category: "xang_dau",
  date: new Date().toISOString().split("T")[0], notes: "",
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [from, setFrom] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
  });
  const [to, setTo] = useState(() => new Date().toISOString().split("T")[0]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchExpenses = useCallback(async () => {
    const params = new URLSearchParams({ from, to });
    if (filterCategory) params.set("category", filterCategory);
    const res = await fetch(`/api/expenses?${params}`);
    setExpenses(await res.json());
  }, [from, to, filterCategory]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  function openCreate() { setEditExpense(null); setForm(emptyForm); setModalOpen(true); }
  function openEdit(e: Expense) {
    setEditExpense(e);
    setForm({ title: e.title, amount: e.amount, category: e.category, date: e.date.split("T")[0], notes: e.notes || "" });
    setModalOpen(true);
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault(); setLoading(true);
    const url = editExpense ? `/api/expenses/${editExpense.id}` : "/api/expenses";
    await fetch(url, { method: editExpense ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setLoading(false); setModalOpen(false); fetchExpenses();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    setDeleteId(null); fetchExpenses();
  }

  const filtered = expenses.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    (e.notes ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const totalAmount = filtered.reduce((s, e) => s + Number(e.amount), 0);

  const byCat = CATEGORIES.map((c) => ({
    ...c,
    total: filtered.filter((e) => e.category === c.value).reduce((s, e) => s + Number(e.amount), 0),
  })).filter((c) => c.total > 0);

  return (
    <>
      <Header title="Chi phí" />
      <div className="flex-1 p-4 md:p-6">
        {/* Date filters */}
        <div className="flex gap-3 mb-3">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Từ ngày</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Đến ngày</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        {/* Search + category + add */}
        <div className="flex items-center gap-2 mb-5">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Tìm..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" />
          </div>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
            className="border border-gray-300 rounded-lg px-2 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[130px]">
            <option value="">Tất cả</option>
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <Button onClick={openCreate} size="sm"><Plus size={15} /></Button>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Receipt size={16} className="text-red-500" />
              <span className="text-sm font-semibold text-gray-700">Tổng chi phí</span>
            </div>
            <span className="text-lg font-bold text-red-600">{formatCurrency(totalAmount)}</span>
          </div>
          {byCat.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {byCat.map((c) => {
                const Icon = c.icon;
                return (
                  <span key={c.value} className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${c.color}`}>
                    <Icon size={11} />{c.label}: {formatCurrency(c.total)}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Mobile + desktop list */}
        <div className="space-y-2 md:hidden">
          {filtered.length === 0 && (
            <p className="text-center py-10 text-gray-400 text-sm">Chưa có chi phí nào</p>
          )}
          {filtered.map((e) => {
            const cat = getCat(e.category);
            const Icon = cat.icon;
            return (
              <div key={e.id} className="bg-white rounded-xl px-4 py-3.5 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-gray-900">{e.title}</p>
                      <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cat.color}`}>
                        <Icon size={10} />{cat.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-400">{formatDate(e.date)}</span>
                      {e.notes && <span className="text-xs text-gray-400 truncate">{e.notes}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="font-bold text-red-600 text-sm">{formatCurrency(Number(e.amount))}</span>
                    <button onClick={() => openEdit(e)} className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"><Pencil size={15} /></button>
                    <button onClick={() => setDeleteId(e.id)} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 size={15} /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Ngày", "Mô tả", "Danh mục", "Ghi chú", "Số tiền", ""].map((h) => (
                  <th key={h} className={`text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 ${h === "Số tiền" ? "text-right" : "text-left"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 && <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">Chưa có chi phí nào</td></tr>}
              {filtered.map((e) => {
                const cat = getCat(e.category);
                const Icon = cat.icon;
                return (
                  <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{formatDate(e.date)}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{e.title}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cat.color}`}>
                        <Icon size={11} />{cat.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{e.notes || "—"}</td>
                    <td className="px-6 py-4 text-right font-semibold text-red-600">{formatCurrency(Number(e.amount))}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => openEdit(e)} className="text-gray-400 hover:text-blue-600 p-1"><Pencil size={15} /></button>
                        <button onClick={() => setDeleteId(e.id)} className="text-gray-400 hover:text-red-600 p-1"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length > 0 && (
                <tr className="bg-gray-50">
                  <td colSpan={4} className="px-6 py-3 text-sm font-semibold text-gray-700">Tổng cộng</td>
                  <td className="px-6 py-3 text-right font-bold text-red-600">{formatCurrency(totalAmount)}</td>
                  <td />
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editExpense ? "Sửa chi phí" : "Thêm chi phí"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Mô tả *</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="VD: Đổ xăng xe máy"
              className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Số tiền (VND) *</label>
              <input type="number" min="0" step="1000" value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0"
                className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Ngày *</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Danh mục *</label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const selected = form.category === cat.value;
                return (
                  <button key={cat.value} type="button"
                    onClick={() => setForm({ ...form, category: cat.value })}
                    className={`flex items-center gap-2 px-3 py-3 rounded-lg border text-sm font-medium transition-colors ${selected ? "border-blue-400 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                    <Icon size={15} />{cat.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Ghi chú</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2} placeholder="Thêm ghi chú..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex gap-3 pt-1">
            <Button variant="secondary" type="button" className="flex-1" onClick={() => setModalOpen(false)}>Hủy</Button>
            <Button type="submit" className="flex-1" disabled={loading}>{loading ? "Đang lưu..." : "Lưu"}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Xác nhận xóa">
        <p className="text-sm text-gray-600 mb-6">Bạn có chắc muốn xóa khoản chi phí này?</p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setDeleteId(null)}>Hủy</Button>
          <Button variant="danger" className="flex-1" onClick={() => deleteId && handleDelete(deleteId)}>Xóa</Button>
        </div>
      </Modal>
    </>
  );
}
