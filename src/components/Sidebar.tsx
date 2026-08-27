import React from "react";
import {
  LayoutDashboard,
  Activity,
  FolderKanban,
  Users,
  BookOpenCheck,
  Settings,
  GraduationCap,
  Radio,
} from "lucide-react";
import type { TabType } from "../types";

type SidebarProps = {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  resultCount: number;
  questionCount: number;
  groupCount: number;
  liveCount: number;
  isRealtimeConnected: boolean;
};

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  resultCount,
  questionCount,
  groupCount,
  liveCount,
  isRealtimeConnected,
}) => {
  const navItems = [
    {
      id: "dashboard" as TabType,
      label: "Dashboard",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: "live" as TabType,
      label: "Jonli Kuzatuv",
      icon: Activity,
      badge: liveCount > 0 ? `${liveCount} faol` : null,
      badgeColor: "bg-emerald-600 text-white font-bold",
    },
    {
      id: "groups" as TabType,
      label: "Guruhlar",
      icon: FolderKanban,
      badge: groupCount > 0 ? String(groupCount) : null,
      badgeColor: "bg-emerald-50 text-emerald-800 border border-emerald-200",
    },
    {
      id: "results" as TabType,
      label: "Natijalar",
      icon: Users,
      badge: resultCount > 0 ? String(resultCount) : null,
      badgeColor: "bg-green-50 text-green-800 border border-green-200",
    },
    {
      id: "questions" as TabType,
      label: "Savollar Bazasi",
      icon: BookOpenCheck,
      badge: questionCount > 0 ? String(questionCount) : null,
      badgeColor: "bg-emerald-100/70 text-emerald-900 border border-emerald-300/80",
    },
    {
      id: "settings" as TabType,
      label: "Sozlamalar",
      icon: Settings,
      badge: null,
    },
  ];


  return (
    <aside className="w-72 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 h-screen sticky top-0 shadow-sm z-30">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-green-700 flex items-center justify-center text-white font-black shadow-md shadow-green-700/20">
            <GraduationCap size={26} />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
              MONDAY <span className="text-[11px] px-2 py-0.5 rounded-md bg-green-100 text-green-800 font-bold border border-green-200">ADMIN</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">Boshqaruv Paneli</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl font-medium text-sm transition-all duration-200 group cursor-pointer ${
                  isActive
                    ? "bg-green-700 text-white shadow-md shadow-green-700/20 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={20}
                    className={`transition-transform duration-200 ${
                      isActive ? "scale-110 text-white" : "group-hover:scale-110 text-slate-400 group-hover:text-green-700"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                      isActive ? "bg-white/25 text-white" : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Realtime Info */}
      <div className="p-4 m-4 rounded-2xl bg-slate-50 border border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span
              className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                isRealtimeConnected ? "bg-emerald-500" : "bg-amber-500"
              }`}
            />
            <div className="text-xs">
              <p className="font-bold text-slate-800">Supabase Realtime</p>
              <p className="text-[11px] text-slate-500">
                {isRealtimeConnected ? "Jonli sinxronizatsiya" : "Ulanmoqda..."}
              </p>
            </div>
          </div>
          <Radio size={16} className={isRealtimeConnected ? "text-emerald-600" : "text-amber-500"} />
        </div>
      </div>
    </aside>
  );
};
