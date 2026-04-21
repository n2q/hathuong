"use client";
import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import { Plus, Pencil, Trash2, Search, MapPin, Users } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import AssignWorkerModal from "@/components/AssignWorkerModal";

interface Owner { id: string; name: string; }
interface Job {
  id: string; name: string; description: string | null; location: string | null;
  startDate: string | null; endDate: string | null; ownerRate: string | null; workerRate: string | null;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED"; owner: Owner; _count: { assignments: number };
}

const emptyForm = {
  name: "", description: "", location: "", startDate: "", endDate: "",
  ownerRate: "", workerRate: "", ownerId: "", status: "ACTIVE",
};

const statusLabel: Record<string, string> = { ACTIVE: "Đang làm", COMPLETED: "Hoàn thành", CANCELLED: "Hủy" };
const statusVariant: Record<string, "green" | "gray" | "red"> = { ACTIVE: "green", COMPLETED: "gray", CANCELLED: "red" };

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [assignJobId, setAssignJobId] = useState<string | null>(null);
  const [editJob, setEditJob] = useState<Job | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function fetchJobs() {
    const res = await fetch("/api/jobs");
    setJobs(await res.json());
  }

  useEffect(() => {
    fetchJobs();
    fetch("/api/owners").then((r) => r.json()).then(setOwners);
  }, []);

  function openCreate() { setEditJob(null); setForm(emptyForm); setModalOpen(true); }
  function openEdit(j: Job) {
    setEditJob(j);
    setForm({
      name: j.name, description: j.description || "", location: j.location || "",
      startDate: j.startDate ? j.startDate.split("T")[0] : "", endDate: j.endDate ? j.endDate.split("T")[0] : "",
      ownerRate: j.ownerRate ?? "", workerRate: j.workerRate ?? "", ownerId: j.owner.id, status: j.status,
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    const url = editJob ? `/api/jobs/${editJob.id}` : "/api/jobs";
    await fetch(url, { method: editJob ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setLoading(false); setModalOpen(false); fetchJobs();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/jobs/${id}`, { method: "DELETE" });
    setDeleteId(null); fetchJobs();
  }

  const filtered = jobs.filter((j) =>
    j.name.toLowerCase().includes(search.toLowerCase()) ||
    j.owner.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Header title="Công việc" />
      <div className="flex-1 p-4 md:p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1 md:flex-none">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Tìm công việc..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-56" />
          </div>
          <Button onClick={openCreate} size="sm"><Plus size={15} className="mr-1" />Thêm</Button>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {filtered.length === 0 && <p className="text-center py-12 text-gray-400 text-sm">Chưa có công việc nào</p>}
          {filtered.map((j) => (
            <div key={j.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900">{j.name}</p>
                    <Badge variant={statusVariant[j.status]}>{statusLabel[j.status]}</Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{j.owner.name}</p>
                  {j.location && (
                    <p className="flex items-center gap-1 text-xs text-gray-400 mt-1"><MapPin size={11} />{j.location}</p>
                  )}
                  <div className="flex flex-wrap gap-3 mt-2">
                    <div className="text-xs">
                      <span className="text-gray-400">Chủ trả: </span>
                      <span className="font-semibold text-green-700">{j.ownerRate != null ? formatCurrency(Number(j.ownerRate)) : "—"}</span>
                    </div>
                    <div className="text-xs">
                      <span className="text-gray-400">CN nhận: </span>
                      <span className="font-semibold text-blue-700">{j.workerRate != null ? formatCurrency(Number(j.workerRate)) : "—"}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                    <span>{j.startDate ? formatDate(j.startDate) : ""}{j.endDate ? ` → ${formatDate(j.endDate)}` : ""}</span>
                    <span className="flex items-center gap-0.5"><Users size={11} />{j._count.assignments} CN</span>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => setAssignJobId(j.id)}
                    className="p-2.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors" title="Phân công">
                    <Users size={16} />
                  </button>
                  <button onClick={() => openEdit(j)} className="p-2.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"><Pencil size={16} /></button>
                  <button onClick={() => setDeleteId(j.id)} className="p-2.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 size={16} /></button>
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
                {["Tên việc", "Chủ vườn", "Địa điểm", "Thời gian", "Giá chủ / CN", "CN", "Trạng thái", ""].map((h) => (
                  <th key={h} className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 && <tr><td colSpan={8} className="text-center py-12 text-gray-400 text-sm">Chưa có công việc nào</td></tr>}
              {filtered.map((j) => (
                <tr key={j.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{j.name}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{j.owner.name}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{j.location ? <span className="flex items-center gap-1"><MapPin size={12} />{j.location}</span> : "—"}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{j.startDate ? formatDate(j.startDate) : "—"}{j.endDate ? ` → ${formatDate(j.endDate)}` : ""}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="text-green-700 font-medium">{j.ownerRate != null ? formatCurrency(Number(j.ownerRate)) : "—"}</span>
                    <span className="text-gray-400 mx-1">/</span>
                    <span className="text-blue-700 font-medium">{j.workerRate != null ? formatCurrency(Number(j.workerRate)) : "—"}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{j._count.assignments}</td>
                  <td className="px-6 py-4"><Badge variant={statusVariant[j.status]}>{statusLabel[j.status]}</Badge></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => setAssignJobId(j.id)} className="text-gray-400 hover:text-green-600 p-1" title="Phân công"><Users size={15} /></button>
                      <button onClick={() => openEdit(j)} className="text-gray-400 hover:text-blue-600 p-1"><Pencil size={15} /></button>
                      <button onClick={() => setDeleteId(j.id)} className="text-gray-400 hover:text-red-600 p-1"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Job form modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editJob ? "Sửa công việc" : "Thêm công việc"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tên công việc *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Chủ vườn *</label>
            <select value={form.ownerId} onChange={(e) => setForm({ ...form, ownerId: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required>
              <option value="">-- Chọn chủ vườn --</option>
              {owners.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Địa điểm</label>
            <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Mô tả</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Ngày bắt đầu</label>
              <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full appearance-none border border-gray-300 rounded-lg px-3 h-11 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Ngày kết thúc</label>
              <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full appearance-none border border-gray-300 rounded-lg px-3 h-11 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Chủ trả/ngày</label>
              <input type="number" value={form.ownerRate} onChange={(e) => setForm({ ...form, ownerRate: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">CN nhận/ngày</label>
              <input type="number" value={form.workerRate} onChange={(e) => setForm({ ...form, workerRate: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Trạng thái</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="ACTIVE">Đang làm</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="CANCELLED">Hủy</option>
            </select>
          </div>
          <div className="flex gap-3 pt-1">
            <Button variant="secondary" type="button" className="flex-1" onClick={() => setModalOpen(false)}>Hủy</Button>
            <Button type="submit" className="flex-1" disabled={loading}>{loading ? "Đang lưu..." : "Lưu"}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Xác nhận xóa">
        <p className="text-sm text-gray-600 mb-6">Bạn có chắc muốn xóa công việc này?</p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setDeleteId(null)}>Hủy</Button>
          <Button variant="danger" className="flex-1" onClick={() => deleteId && handleDelete(deleteId)}>Xóa</Button>
        </div>
      </Modal>

      {assignJobId && (
        <AssignWorkerModal jobId={assignJobId} onClose={() => { setAssignJobId(null); fetchJobs(); }} />
      )}
    </>
  );
}
