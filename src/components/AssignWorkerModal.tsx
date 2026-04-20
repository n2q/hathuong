"use client";
import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { UserPlus, UserMinus } from "lucide-react";

interface Worker { id: string; name: string; phone: string | null; }
interface Assignment { worker: Worker; }

interface Props {
  jobId: string;
  onClose: () => void;
}

export default function AssignWorkerModal({ jobId, onClose }: Props) {
  const [allWorkers, setAllWorkers] = useState<Worker[]>([]);
  const [assigned, setAssigned] = useState<Assignment[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [jobName, setJobName] = useState("");

  useEffect(() => {
    fetch("/api/workers?status=ACTIVE").then((r) => r.json()).then(setAllWorkers);
    fetch(`/api/assignments?jobId=${jobId}`).then((r) => r.json()).then((data: Assignment[]) => {
      setAssigned(data);
      setSelected(data.map((a) => a.worker.id));
    });
    fetch(`/api/jobs/${jobId}`).then((r) => r.json()).then((j) => setJobName(j.name));
  }, [jobId]);

  const assignedIds = new Set(assigned.map((a) => a.worker.id));

  async function handleSave() {
    setLoading(true);
    const toAdd = selected.filter((id) => !assignedIds.has(id));
    const toRemove = [...assignedIds].filter((id) => !selected.includes(id));

    if (toAdd.length) {
      await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, workerIds: toAdd }),
      });
    }

    for (const workerId of toRemove) {
      await fetch("/api/assignments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, workerId }),
      });
    }

    setLoading(false);
    onClose();
  }

  function toggle(id: string) {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  return (
    <Modal open onClose={onClose} title={`Phân công: ${jobName}`}>
      <div className="space-y-3 max-h-80 overflow-y-auto mb-4">
        {allWorkers.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">Không có công nhân hoạt động</p>
        )}
        {allWorkers.map((w) => {
          const isSelected = selected.includes(w.id);
          return (
            <label key={w.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${isSelected ? "border-blue-300 bg-blue-50" : "border-gray-200 hover:bg-gray-50"}`}>
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggle(w.id)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <div className="flex items-center gap-2">
                {isSelected ? <UserPlus size={14} className="text-blue-500" /> : <UserMinus size={14} className="text-gray-400" />}
                <span className="text-sm font-medium text-gray-900">{w.name}</span>
                {w.phone && <span className="text-xs text-gray-500">{w.phone}</span>}
              </div>
            </label>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <span className="text-sm text-gray-500">{selected.length} công nhân được chọn</span>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose}>Hủy</Button>
          <Button onClick={handleSave} disabled={loading}>{loading ? "Đang lưu..." : "Lưu phân công"}</Button>
        </div>
      </div>
    </Modal>
  );
}
