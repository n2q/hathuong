"use client";
import { useState, useMemo } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { SidebarContext } from "@/lib/sidebar-context";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ctx = useMemo(() => ({ toggle: () => setOpen((v) => !v) }), []);

  return (
    <SidebarContext.Provider value={ctx}>
      <div className="flex h-full min-h-screen">
        {/* Mobile overlay backdrop */}
        {open && (
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setOpen(false)}
          />
        )}

        {/* Sidebar — always visible on md+, drawer on mobile */}
        <div
          className={`fixed inset-y-0 left-0 z-50 transition-transform duration-200 ease-in-out md:relative md:translate-x-0 md:flex md:flex-shrink-0 ${
            open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          <Sidebar onClose={() => setOpen(false)} />
        </div>

        <main className="flex-1 flex flex-col min-h-screen overflow-auto bg-gray-50 min-w-0">
          {children}
        </main>
      </div>
    </SidebarContext.Provider>
  );
}
