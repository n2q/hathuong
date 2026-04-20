"use client";
import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Badge from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, Download } from "lucide-react";

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
      <div className="flex-1 p-6">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setType(t.key)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${type === t.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <label className="text-sm text-gray-600">Từ:</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <label className="text-sm text-gray-600">Đến:</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="py-12 text-center text-gray-400 text-sm">Đang tải...</div>
          ) : type === "worker" ? (
            <WorkerReport data={data as WorkerRow[]} />
          ) : type === "job" ? (
            <JobReport data={data as JobRow[]} />
          ) : (
            <OwnerReport data={data as OwnerRow[]} />
          )}
        </div>
      </div>
    </>
  );
}

function WorkerReport({ data }: { data: WorkerRow[] }) {
  const totalDays = data.reduce((s, r) => s + r.daysWorked, 0);
  const totalPay = data.reduce((s, r) => s + r.totalEarnings, 0);
  return (
    <table className="w-full">
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
        {data.length > 0 && (
          <tr className="bg-gray-50 font-semibold">
            <td className="px-6 py-3 text-gray-700" colSpan={2}>Tổng cộng</td>
            <td className="px-6 py-3 text-right text-gray-900">{totalDays}</td>
            <td className="px-6 py-3 text-right text-blue-700">{formatCurrency(totalPay)}</td>
          </tr>
        )}
        {data.length === 0 && (
          <tr><td colSpan={4} className="text-center py-12 text-gray-400 text-sm">Không có dữ liệu</td></tr>
        )}
      </tbody>
    </table>
  );
}

function JobReport({ data }: { data: JobRow[] }) {
  const totalRevenue = data.reduce((s, r) => s + r.revenue, 0);
  const totalCost = data.reduce((s, r) => s + r.cost, 0);
  const totalProfit = data.reduce((s, r) => s + r.profit, 0);
  return (
    <table className="w-full">
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
            <td className="px-6 py-4 text-right font-semibold">
              <span className={r.profit >= 0 ? "text-blue-700" : "text-red-700"}>{formatCurrency(r.profit)}</span>
            </td>
          </tr>
        ))}
        {data.length > 0 && (
          <tr className="bg-gray-50 font-semibold">
            <td className="px-6 py-3 text-gray-700" colSpan={4}>Tổng cộng</td>
            <td className="px-6 py-3 text-right text-green-700">{formatCurrency(totalRevenue)}</td>
            <td className="px-6 py-3 text-right text-red-600">{formatCurrency(totalCost)}</td>
            <td className="px-6 py-3 text-right"><span className={totalProfit >= 0 ? "text-blue-700" : "text-red-700"}>{formatCurrency(totalProfit)}</span></td>
          </tr>
        )}
        {data.length === 0 && (
          <tr><td colSpan={7} className="text-center py-12 text-gray-400 text-sm">Không có dữ liệu</td></tr>
        )}
      </tbody>
    </table>
  );
}

function OwnerReport({ data }: { data: OwnerRow[] }) {
  const totalOwed = data.reduce((s, r) => s + r.totalOwed, 0);
  return (
    <table className="w-full">
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
        {data.length > 0 && (
          <tr className="bg-gray-50 font-semibold">
            <td className="px-6 py-3 text-gray-700" colSpan={3}>Tổng cộng</td>
            <td className="px-6 py-3 text-right text-green-700">{formatCurrency(totalOwed)}</td>
          </tr>
        )}
        {data.length === 0 && (
          <tr><td colSpan={4} className="text-center py-12 text-gray-400 text-sm">Không có dữ liệu</td></tr>
        )}
      </tbody>
    </table>
  );
}
