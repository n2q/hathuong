"use client";
import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import { Plus, Pencil, Trash2, Search, Phone, MapPin } from "lucide-react";
import { SkeletonCard, SkeletonRow } from "@/components/ui/Skeleton";

interface Worker {
  id: string;
  name: string;
  age: number | null;
  address: string | null;
  phone: string | null;
  status: "ACTIVE" | "INACTIVE";
  _count: { assignments: number };
}

const emptyForm = { name: "", age: "", address: "", phone: "", status: "ACTIVE" };

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editWorker, setEditWorker] = useState<Worker | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function fetchWorkers() {
    const res = await fetch("/api/workers");
    setWorkers(await res.json());
    setFetching(false);
  }

  useEffect(() => { fetchWorkers(); }, []);

  function openCreate() {
    setEditWorker(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(w: Worker) {
    setEditWorker(w);
    setForm({ name: w.name, age: w.age?.toString() || "", address: w.address || "", phone: w.phone || "", status: w.status });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const url = editWorker ? `/api/workers/${editWorker.id}` : "/api/workers";
    const method = editWorker ? "PUT" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setLoading(false);
    setModalOpen(false);
    fetchWorkers();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/workers/${id}`, { method: "DELETE" });
    setDeleteId(null);
    fetchWorkers();
  }

  const filtered = workers.filter((w) =>
    w.name.toLowerCase().includes(search.toLowerCase()) || w.phone?.includes(search)
  );

  return (
    <>
      <Header title="Công nhân" />
      <div className="flex-1 p-4 md:p-6">
        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1 md:flex-none">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm tên, SĐT..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-56"
            />
          </div>
          <Button onClick={openCreate} size="sm">
            <Plus size={15} className="mr-1" />
            <span className="hidden sm:inline">Thêm</span>
            <span className="sm:hidden">Thêm</span>
          </Button>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {fetching ? (
            [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
          ) : filtered.length === 0 ? (
            <p className="text-center py-12 text-gray-400 text-sm">Chưa có công nhân nào</p>
          ) : filtered.map((w) => (
            <div key={w.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900">{w.name}</p>
                    {w.age && <span className="text-xs text-gray-400">{w.age} tuổi</span>}
                    <Badge variant={w.status === "ACTIVE" ? "green" : "gray"}>
                      {w.status === "ACTIVE" ? "Hoạt động" : "Nghỉ"}
                    </Badge>
                  </div>
                  <div className="mt-1.5 space-y-0.5">
                    {w.phone && (
                      <a href={`tel:${w.phone}`} className="flex items-center gap-1.5 text-sm text-blue-600">
                        <Phone size={13} />{w.phone}
                      </a>
                    )}
                    {w.address && (
                      <p className="flex items-center gap-1.5 text-sm text-gray-500">
                        <MapPin size={13} />{w.address}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">{w._count.assignments} công việc</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openEdit(w)}
                    className="p-2.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => setDeleteId(w.id)}
                    className="p-2.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Tên</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Tuổi</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Liên hệ</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Địa chỉ</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Việc</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Trạng thái</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {fetching ? (
                [...Array(5)].map((_, i) => <SkeletonRow key={i} cells={7} />)
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400 text-sm">Chưa có công nhân nào</td></tr>
              ) : filtered.map((w) => (
                <tr key={w.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{w.name}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{w.age || "—"}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm">
                    {w.phone ? <span className="flex items-center gap-1"><Phone size={12} />{w.phone}</span> : "—"}
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">
                    {w.address ? <span className="flex items-center gap-1"><MapPin size={12} />{w.address}</span> : "—"}
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{w._count.assignments}</td>
                  <td className="px-6 py-4">
                    <Badge variant={w.status === "ACTIVE" ? "green" : "gray"}>
                      {w.status === "ACTIVE" ? "Hoạt động" : "Nghỉ"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(w)} className="text-gray-400 hover:text-blue-600 transition-colors p-1"><Pencil size={15} /></button>
                      <button onClick={() => setDeleteId(w.id)} className="text-gray-400 hover:text-red-600 transition-colors p-1"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editWorker ? "Sửa công nhân" : "Thêm công nhân"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Họ tên *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tuổi</label>
              <input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">SĐT</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Địa chỉ</label>
            <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Trạng thái</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="ACTIVE">Hoạt động</option>
              <option value="INACTIVE">Nghỉ</option>
            </select>
          </div>
          <div className="flex gap-3 pt-1">
            <Button variant="secondary" type="button" className="flex-1" onClick={() => setModalOpen(false)}>Hủy</Button>
            <Button type="submit" className="flex-1" disabled={loading}>{loading ? "Đang lưu..." : "Lưu"}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Xác nhận xóa">
        <p className="text-sm text-gray-600 mb-6">Bạn có chắc muốn xóa công nhân này?</p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setDeleteId(null)}>Hủy</Button>
          <Button variant="danger" className="flex-1" onClick={() => deleteId && handleDelete(deleteId)}>Xóa</Button>
        </div>
      </Modal>
    </>
  );
}
