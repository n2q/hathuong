"use client";
import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Badge from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";

type ReportType = "worker" | "job" | "owner";

interface WorkerRow { id: string; name: string; phone: string | null; daysWorked: number; totalEarnings: number; }
interface JobRow { id: string; name: string; ownerName: string; location: string | null; status: string; totalWorkerDays: number; revenue: number; cost: number; profit: number; }
interface OwnerRow { id: string; name: string; phone: string | null; totalWorkerDays: number; totalOwed: number; }

const tabs: { key: ReportType; label: string }[] = [
  { key: "worker", label: "Công nhân" },
  { key: "job", label: "Công việc" },
  { key: "owner", label: "Chủ vườn" },
];

const statusLabel: Record<string, string> = { ACTIVE: "Đang làm", COMPLETED: "Hoàn thành", CANCELLED: "Hủy" };
const statusVariant: Record<string, "green" | "gray" | "red"> = { ACTIVE: "green", COMPLETED: "gray", CANCELLED: "red" };

export default function ReportsPage() {
  const [type, setType] = useState<ReportType>("worker");
  const [from, setFrom] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
  });
  const [to, setTo] = useState(() => new Date().toISOString().split("T")[0]);
  const [data, setData] = useState<WorkerRow[] | JobRow[] | OwnerRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/reports?type=${type}&from=${from}&to=${to}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); });
  }, [type, from, to]);

  return (
    <>
      <Header title="Báo cáo" />
      <div className="flex-1 p-4 md:p-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-4">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setType(t.key)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${type === t.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}>
              {t.label}
            </button>
          ))}
        </div>
        {/* Date filters */}
        <div className="flex flex-col sm:flex-row gap-2 mb-5">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Từ ngày</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
              className="w-full appearance-none border border-gray-300 rounded-lg px-3 h-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Đến ngày</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
              className="w-full appearance-none border border-gray-300 rounded-lg px-3 h-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl py-12 text-center text-gray-400 text-sm border border-gray-100 shadow-sm">Đang tải...</div>
        ) : type === "worker" ? (
          <WorkerReport data={data as WorkerRow[]} />
        ) : type === "job" ? (
          <JobReport data={data as JobRow[]} />
        ) : (
          <OwnerReport data={data as OwnerRow[]} />
        )}
      </div>
    </>
  );
}

function WorkerReport({ data }: { data: WorkerRow[] }) {
  const totalDays = data.reduce((s, r) => s + r.daysWorked, 0);
  const totalPay = data.reduce((s, r) => s + r.totalEarnings, 0);
  if (data.length === 0) return <Empty />;
  return (
    <>
      {/* Mobile cards */}
      <div className="md:hidden space-y-2 p-4">
        {data.map((r) => (
          <div key={r.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">{r.name}</p>
              {r.phone && <p className="text-sm text-gray-500 mt-0.5">{r.phone}</p>}
              <p className="text-xs text-gray-400 mt-1">{r.daysWorked} ngày làm</p>
            </div>
            <p className="text-blue-700 font-bold text-base">{formatCurrency(r.totalEarnings)}</p>
          </div>
        ))}
        <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between border border-gray-100">
          <span className="text-sm font-semibold text-gray-700">Tổng: {totalDays} ngày</span>
          <span className="font-bold text-blue-700">{formatCurrency(totalPay)}</span>
        </div>
      </div>
      {/* Desktop table */}
      <table className="w-full hidden md:table">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Công nhân</th>
            <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">SĐT</th>
            <th className="text-right text-xs font-medium text-gray-500 uppercase px-6 py-3">Ngày làm</th>
            <th className="text-right text-xs font-medium text-gray-500 uppercase px-6 py-3">Tổng lương</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.map((r) => (
            <tr key={r.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 font-medium text-gray-900">{r.name}</td>
              <td className="px-6 py-4 text-gray-600 text-sm">{r.phone || "—"}</td>
              <td className="px-6 py-4 text-right text-gray-900 font-medium">{r.daysWorked}</td>
              <td className="px-6 py-4 text-right text-blue-700 font-medium">{formatCurrency(r.totalEarnings)}</td>
            </tr>
          ))}
          <tr className="bg-gray-50 font-semibold">
            <td className="px-6 py-3 text-gray-700" colSpan={2}>Tổng cộng</td>
            <td className="px-6 py-3 text-right text-gray-900">{totalDays}</td>
            <td className="px-6 py-3 text-right text-blue-700">{formatCurrency(totalPay)}</td>
          </tr>
        </tbody>
      </table>
    </>
  );
}

function JobReport({ data }: { data: JobRow[] }) {
  const totalRevenue = data.reduce((s, r) => s + r.revenue, 0);
  const totalCost = data.reduce((s, r) => s + r.cost, 0);
  const totalProfit = data.reduce((s, r) => s + r.profit, 0);
  if (data.length === 0) return <Empty />;
  return (
    <>
      {/* Mobile cards */}
      <div className="md:hidden space-y-2 p-4">
        {data.map((r) => (
          <div key={r.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <p className="font-semibold text-gray-900">{r.name}</p>
                <p className="text-xs text-gray-500">{r.ownerName}</p>
              </div>
              <Badge variant={statusVariant[r.status]}>{statusLabel[r.status]}</Badge>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center bg-gray-50 rounded-lg p-2">
              <div>
                <p className="text-xs text-gray-400">Doanh thu</p>
                <p className="text-sm font-semibold text-green-700">{formatCurrency(r.revenue)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Chi phí</p>
                <p className="text-sm font-semibold text-red-600">{formatCurrency(r.cost)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Lợi nhuận</p>
                <p className={`text-sm font-bold ${r.profit >= 0 ? "text-blue-700" : "text-red-700"}`}>{formatCurrency(r.profit)}</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-1.5">{r.totalWorkerDays} ngày-công nhân</p>
          </div>
        ))}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div><p className="text-xs text-gray-400">Tổng DT</p><p className="font-bold text-green-700">{formatCurrency(totalRevenue)}</p></div>
            <div><p className="text-xs text-gray-400">Tổng CP</p><p className="font-bold text-red-600">{formatCurrency(totalCost)}</p></div>
            <div><p className="text-xs text-gray-400">Tổng LN</p><p className={`font-bold ${totalProfit >= 0 ? "text-blue-700" : "text-red-700"}`}>{formatCurrency(totalProfit)}</p></div>
          </div>
        </div>
      </div>
      {/* Desktop table */}
      <table className="w-full hidden md:table">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Công việc</th>
            <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Chủ vườn</th>
            <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Trạng thái</th>
            <th className="text-right text-xs font-medium text-gray-500 uppercase px-6 py-3">Ngày-CN</th>
            <th className="text-right text-xs font-medium text-gray-500 uppercase px-6 py-3">Doanh thu</th>
            <th className="text-right text-xs font-medium text-gray-500 uppercase px-6 py-3">Chi phí</th>
            <th className="text-right text-xs font-medium text-gray-500 uppercase px-6 py-3">Lợi nhuận</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.map((r) => (
            <tr key={r.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 font-medium text-gray-900">{r.name}</td>
              <td className="px-6 py-4 text-gray-600 text-sm">{r.ownerName}</td>
              <td className="px-6 py-4"><Badge variant={statusVariant[r.status]}>{statusLabel[r.status]}</Badge></td>
              <td className="px-6 py-4 text-right text-gray-700">{r.totalWorkerDays}</td>
              <td className="px-6 py-4 text-right text-green-700 font-medium">{formatCurrency(r.revenue)}</td>
              <td className="px-6 py-4 text-right text-red-600 font-medium">{formatCurrency(r.cost)}</td>
              <td className="px-6 py-4 text-right font-semibold"><span className={r.profit >= 0 ? "text-blue-700" : "text-red-700"}>{formatCurrency(r.profit)}</span></td>
            </tr>
          ))}
          <tr className="bg-gray-50 font-semibold">
            <td className="px-6 py-3 text-gray-700" colSpan={4}>Tổng cộng</td>
            <td className="px-6 py-3 text-right text-green-700">{formatCurrency(totalRevenue)}</td>
            <td className="px-6 py-3 text-right text-red-600">{formatCurrency(totalCost)}</td>
            <td className="px-6 py-3 text-right"><span className={totalProfit >= 0 ? "text-blue-700" : "text-red-700"}>{formatCurrency(totalProfit)}</span></td>
          </tr>
        </tbody>
      </table>
    </>
  );
}

function OwnerReport({ data }: { data: OwnerRow[] }) {
  const totalOwed = data.reduce((s, r) => s + r.totalOwed, 0);
  if (data.length === 0) return <Empty />;
  return (
    <>
      {/* Mobile cards */}
      <div className="md:hidden space-y-2 p-4">
        {data.map((r) => (
          <div key={r.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">{r.name}</p>
              {r.phone && <p className="text-sm text-gray-500 mt-0.5">{r.phone}</p>}
              <p className="text-xs text-gray-400 mt-1">{r.totalWorkerDays} ngày-công nhân</p>
            </div>
            <p className="text-green-700 font-bold text-base">{formatCurrency(r.totalOwed)}</p>
          </div>
        ))}
        <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between border border-gray-100">
          <span className="text-sm font-semibold text-gray-700">Tổng phải thu</span>
          <span className="font-bold text-green-700">{formatCurrency(totalOwed)}</span>
        </div>
      </div>
      {/* Desktop table */}
      <table className="w-full hidden md:table">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Chủ vườn</th>
            <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">SĐT</th>
            <th className="text-right text-xs font-medium text-gray-500 uppercase px-6 py-3">Ngày-CN</th>
            <th className="text-right text-xs font-medium text-gray-500 uppercase px-6 py-3">Tổng phải thu</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.map((r) => (
            <tr key={r.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 font-medium text-gray-900">{r.name}</td>
              <td className="px-6 py-4 text-gray-600 text-sm">{r.phone || "—"}</td>
              <td className="px-6 py-4 text-right text-gray-700">{r.totalWorkerDays}</td>
              <td className="px-6 py-4 text-right text-green-700 font-semibold">{formatCurrency(r.totalOwed)}</td>
            </tr>
          ))}
          <tr className="bg-gray-50 font-semibold">
            <td className="px-6 py-3 text-gray-700" colSpan={3}>Tổng cộng</td>
            <td className="px-6 py-3 text-right text-green-700">{formatCurrency(totalOwed)}</td>
          </tr>
        </tbody>
      </table>
    </>
  );
}

function Empty() {
  return <p className="text-center py-12 text-gray-400 text-sm">Không có dữ liệu trong kỳ này</p>;
}
