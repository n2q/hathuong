"use client";
import { useSession } from "next-auth/react";
import { Menu, User } from "lucide-react";
import { useSidebar } from "@/lib/sidebar-context";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const { data: session } = useSession();
  const { toggle } = useSidebar();

  return (
    <header className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-30">
      {/* Hamburger — only on mobile */}
      <button
        onClick={toggle}
        className="md:hidden p-2 -ml-1 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
        aria-label="Open menu"
      >
        <Menu size={22} />
      </button>

      <h2 className="flex-1 text-lg font-semibold text-gray-800 truncate">{title}</h2>

      <div className="flex items-center gap-1.5 text-sm text-gray-500">
        <User size={15} />
        <span className="hidden sm:inline">{session?.user?.name || "Admin"}</span>
      </div>
    </header>
  );
}
