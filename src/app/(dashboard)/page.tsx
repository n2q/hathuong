"use client";
import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import { formatCurrency } from "@/lib/utils";
import {
  Users,
  Briefcase,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CalendarDays,
  UserCheck,
  Building2,
  Receipt,
} from "lucide-react";

interface DashboardData {
  workingToday: number;
  scheduledTomorrow: number;
  activeJobs: number;
  totalRevenue: number;
  totalCost: number;
  totalExpenses: number;
  totalProfit: number;
  netProfit: number;
  totalWorkers: number;
  totalOwners: number;
}

function StatCard({
  title,
  value,
  sub,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-gray-500 leading-tight">{title}</p>
        <div className={`p-1.5 rounded-lg ${color}`}>
          <Icon size={15} className="text-white" />
        </div>
      </div>
      <p className="text-xl font-bold text-gray-900 leading-tight">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [from, setFrom] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
  });
  const [to, setTo] = useState(() => new Date().toISOString().split("T")[0]);

  useEffect(() => {
    fetch(`/api/dashboard?from=${from}&to=${to}`)
      .then((r) => r.json())
      .then(setData);
  }, [from, to]);

  return (
    <>
      <Header title="Dashboard" />
      <div className="flex-1 p-4 md:p-6">
        <div className="flex gap-3 mb-5">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Từ ngày</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Đến ngày</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <StatCard
            title="Đang làm hôm nay"
            value={data?.workingToday ?? "—"}
            icon={Users}
            color="bg-blue-500"
            sub="công nhân có mặt"
          />
          <StatCard
            title="Lịch làm ngày mai"
            value={data?.scheduledTomorrow ?? "—"}
            icon={CalendarDays}
            color="bg-purple-500"
            sub="công nhân dự kiến"
          />
          <StatCard
            title="Việc đang hoạt động"
            value={data?.activeJobs ?? "—"}
            icon={Briefcase}
            color="bg-orange-500"
            sub="công việc"
          />
          <StatCard
            title="Tổng công nhân"
            value={data?.totalWorkers ?? "—"}
            icon={UserCheck}
            color="bg-green-500"
            sub={`${data?.totalOwners ?? "—"} chủ vườn`}
          />
        </div>

        <h3 className="text-sm font-semibold text-gray-600 mb-3">Tài chính kỳ đã chọn</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            title="Doanh thu"
            value={data ? formatCurrency(data.totalRevenue) : "—"}
            icon={TrendingUp}
            color="bg-green-500"
            sub="chủ vườn trả"
          />
          <StatCard
            title="Lương công nhân"
            value={data ? formatCurrency(data.totalCost) : "—"}
            icon={TrendingDown}
            color="bg-orange-500"
            sub="trả cho công nhân"
          />
          <StatCard
            title="Chi phí khác"
            value={data ? formatCurrency(data.totalExpenses) : "—"}
            icon={Receipt}
            color="bg-red-500"
            sub="xăng, ăn uống, v.v."
          />
          <StatCard
            title="Lợi nhuận ròng"
            value={data ? formatCurrency(data.netProfit) : "—"}
            icon={DollarSign}
            color={data && data.netProfit >= 0 ? "bg-blue-600" : "bg-red-600"}
            sub="sau tất cả chi phí"
          />
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl px-6 py-4 flex flex-wrap items-center gap-6 text-sm">
          <div>
            <span className="text-gray-500">Lợi nhuận gộp: </span>
            <span className="font-semibold text-gray-800">{data ? formatCurrency(data.totalProfit) : "—"}</span>
            <span className="text-gray-400 ml-1">(doanh thu − lương)</span>
          </div>
          <div className="text-gray-300">|</div>
          <div>
            <span className="text-gray-500">Chi phí khác: </span>
            <span className="font-semibold text-red-600">− {data ? formatCurrency(data.totalExpenses) : "—"}</span>
          </div>
          <div className="text-gray-300">|</div>
          <div>
            <span className="text-gray-500">Lợi nhuận ròng: </span>
            <span className={`font-bold ${data && data.netProfit >= 0 ? "text-blue-700" : "text-red-700"}`}>
              {data ? formatCurrency(data.netProfit) : "—"}
            </span>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Building2 size={18} className="text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-700">Tóm tắt</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">{data?.totalWorkers ?? "—"}</p>
              <p className="text-xs text-gray-500 mt-1">Công nhân hoạt động</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{data?.totalOwners ?? "—"}</p>
              <p className="text-xs text-gray-500 mt-1">Chủ vườn</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{data?.activeJobs ?? "—"}</p>
              <p className="text-xs text-gray-500 mt-1">Việc đang làm</p>
            </div>
            <div>
              <p className={`text-2xl font-bold ${data && data.netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                {data ? Math.round((data.netProfit / (data.totalRevenue || 1)) * 100) : "—"}%
              </p>
              <p className="text-xs text-gray-500 mt-1">Biên lợi nhuận ròng</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
