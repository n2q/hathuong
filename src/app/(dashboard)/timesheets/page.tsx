"use client";
import { useEffect, useState, useCallback } from "react";
import Header from "@/components/layout/Header";
import Button from "@/components/ui/Button";
import { CheckCircle, XCircle, Save } from "lucide-react";

interface Job { id: string; name: string; owner: { name: string }; }
interface Worker { id: string; name: string; }
interface Assignment { id: string; worker: Worker; }
interface TimesheetEntry { assignmentId: string; status: "PRESENT" | "ABSENT" }

export default function TimesheetsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [attendance, setAttendance] = useState<Record<string, "PRESENT" | "ABSENT">>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  useEffect(() => {
    fetch("/api/jobs?status=ACTIVE")
      .then((r) => r.ok ? r.json() : [])
      .then(setJobs);
  }, []);

  const loadAttendance = useCallback(async () => {
    if (!selectedJob) return;
    setLoadingAssignments(true);
    const [assignRes, tsRes] = await Promise.all([
      fetch(`/api/assignments?jobId=${selectedJob}`),
      fetch(`/api/timesheets?jobId=${selectedJob}&date=${selectedDate}`),
    ]);
    const assignData: Assignment[] = assignRes.ok ? await assignRes.json() : [];
    const tsData: { assignmentId: string; status: "PRESENT" | "ABSENT" }[] = tsRes.ok ? await tsRes.json() : [];
    setAssignments(assignData);
    const map: Record<string, "PRESENT" | "ABSENT"> = {};
    for (const a of assignData) map[a.id] = "PRESENT";
    for (const ts of tsData) map[ts.assignmentId] = ts.status;
    setAttendance(map);
    setLoadingAssignments(false);
  }, [selectedJob, selectedDate]);

  useEffect(() => { loadAttendance(); }, [loadAttendance]);

  function toggle(assignmentId: string) {
    setAttendance((prev) => ({
      ...prev,
      [assignmentId]: prev[assignmentId] === "PRESENT" ? "ABSENT" : "PRESENT",
    }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    const entries: TimesheetEntry[] = assignments.map((a) => ({
      assignmentId: a.id,
      date: selectedDate,
      status: attendance[a.id] || "PRESENT",
    }));
    await fetch("/api/timesheets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entries }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const presentCount = assignments.filter((a) => attendance[a.id] !== "ABSENT").length;
  const absentCount = assignments.length - presentCount;

  return (
    <>
      <Header title="Chấm công" />
      <div className="flex-1 p-4 md:p-6">
        {/* Filters */}
        <div className="space-y-3 mb-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Công việc</label>
            <select value={selectedJob} onChange={(e) => setSelectedJob(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">-- Chọn công việc --</option>
              {jobs.map((j) => <option key={j.id} value={j.id}>{j.name} ({j.owner.name})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Ngày chấm công</label>
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        {!selectedJob ? (
          <div className="bg-white rounded-xl p-10 text-center text-gray-400 border border-gray-100 shadow-sm">
            <p className="text-sm">Chọn công việc để bắt đầu chấm công</p>
          </div>
        ) : loadingAssignments ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse h-14 bg-gray-200 rounded-xl" />
            ))}
          </div>
        ) : assignments.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center text-gray-400 border border-gray-100 shadow-sm">
            <p className="text-sm">Công việc này chưa có công nhân được phân công</p>
          </div>
        ) : (
          <>
            {/* Summary bar */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium">
                <CheckCircle size={14} />{presentCount} có mặt
              </div>
              <div className="flex items-center gap-1.5 bg-red-100 text-red-700 px-3 py-1.5 rounded-full text-sm font-medium">
                <XCircle size={14} />{absentCount} vắng
              </div>
              <span className="text-sm text-gray-400 ml-auto">{assignments.length} tổng</span>
            </div>

            {/* Worker list — card-based on all sizes for easy tapping */}
            <div className="space-y-2 mb-5">
              {assignments.map((a) => {
                const isPresent = attendance[a.id] !== "ABSENT";
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => toggle(a.id)}
                    className={`w-full flex items-center justify-between px-4 py-4 rounded-xl border-2 transition-colors text-left ${isPresent
                        ? "border-green-300 bg-green-50"
                        : "border-red-200 bg-red-50"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      {isPresent
                        ? <CheckCircle size={22} className="text-green-500 shrink-0" />
                        : <XCircle size={22} className="text-red-400 shrink-0" />
                      }
                      <span className="font-medium text-gray-900">{a.worker.name}</span>
                    </div>
                    <span className={`text-sm font-medium px-3 py-1 rounded-full ${isPresent ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                      }`}>
                      {isPresent ? "Có mặt" : "Vắng mặt"}
                    </span>
                  </button>
                );
              })}
            </div>

            <Button onClick={handleSave} disabled={saving} size="lg" className="w-full">
              <Save size={17} className="mr-2" />
              {saving ? "Đang lưu..." : saved ? "Đã lưu ✓" : "Lưu chấm công"}
            </Button>
          </>
        )}
      </div>
    </>
  );
}
