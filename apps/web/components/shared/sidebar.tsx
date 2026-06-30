"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth";
import { LayoutDashboard, Box, Trophy, FileText, Info, HelpCircle, Phone, Building, ChevronRight, ChevronDown } from "lucide-react";
import { useState } from "react";

export default function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const [appsOpen, setAppsOpen] = useState(true);

  return (
    <aside className="w-[255px] min-h-[calc(100vh-48px)] h-full bg-white flex flex-col p-2">
      {/* Logo */}
      <div className="p-2 flex items-center gap-2.5 mb-2">
        <div className="bg-blue-600 rounded-lg p-1.5 flex items-center justify-center shrink-0">
          <div className="w-3.5 h-3.5 border-2 border-white rounded-sm" />
        </div>
        <span className="font-semibold text-[18px] text-[#0A0A0A] flex-1 tracking-tight">Actify</span>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 flex flex-col gap-1 mt-2">
        <div className="px-2 py-1 mb-1">
          <span className="text-[14px] font-medium text-[#0A0A0A] opacity-70">Main</span>
        </div>
        
        <Link href="/dashboard" className="flex items-center gap-2.5 px-2.5 py-2 bg-blue-500 rounded-md text-white">
          <LayoutDashboard size={18} strokeWidth={2} />
          <span className="text-[16px] font-normal">Dashboard</span>
        </Link>
        
        <div className="flex flex-col gap-1 mt-1">
          <button 
            onClick={() => setAppsOpen(!appsOpen)}
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-md hover:bg-gray-100 text-[#0A0A0A] transition-colors"
          >
            <Box size={18} strokeWidth={2} />
            <span className="text-[16px] font-normal flex-1 text-left">My applications</span>
            {appsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          
          {/* Sub menu */}
          {appsOpen && (
            <div className="pl-8 flex flex-col gap-1 border-l-2 border-[#D4D4D4] ml-5 mb-1 py-0.5">
              <button className="px-3 py-1.5 text-[#737373] hover:text-[#0A0A0A] text-left text-[16px] transition-colors rounded-md hover:bg-gray-50">Educational grant</button>
              <button className="px-3 py-1.5 text-[#737373] hover:text-[#0A0A0A] text-left text-[16px] transition-colors rounded-md hover:bg-gray-50">Additional state grant</button>
            </div>
          )}

          <Link href="#" className="flex items-center gap-2.5 px-2.5 py-2 rounded-md hover:bg-gray-100 text-[#0A0A0A] transition-colors">
            <Trophy size={18} strokeWidth={2} />
            <span className="text-[16px] font-normal flex-1">Ranking</span>
          </Link>
          <Link href="#" className="flex items-center gap-2.5 px-2.5 py-2 rounded-md hover:bg-gray-100 text-[#0A0A0A] transition-colors">
            <FileText size={18} strokeWidth={2} />
            <span className="text-[16px] font-normal flex-1">Report</span>
          </Link>
          <Link href="#" className="flex items-center gap-2.5 px-2.5 py-2 rounded-md hover:bg-gray-100 text-[#0A0A0A] transition-colors">
            <Info size={18} strokeWidth={2} />
            <span className="text-[16px] font-normal flex-1">Information</span>
          </Link>
        </div>
      </nav>

      {/* Footer Nav */}
      <div className="flex flex-col gap-1 mt-auto pt-4 border-t border-transparent">
        <Link href="#" className="flex items-center gap-2.5 px-2.5 py-2 rounded-md hover:bg-gray-100 text-[#0A0A0A] transition-colors">
          <Building size={18} strokeWidth={2} />
          <span className="text-[16px] font-normal">About us</span>
        </Link>
        <Link href="#" className="flex items-center gap-2.5 px-2.5 py-2 rounded-md hover:bg-gray-100 text-[#0A0A0A] transition-colors">
          <HelpCircle size={18} strokeWidth={2} />
          <span className="text-[16px] font-normal">Support</span>
        </Link>
        <Link href="#" className="flex items-center gap-2.5 px-2.5 py-2 rounded-md hover:bg-gray-100 text-[#0A0A0A] transition-colors">
          <Phone size={18} strokeWidth={2} />
          <span className="text-[16px] font-normal">Contact us</span>
        </Link>
      </div>
    </aside>
  );
}
