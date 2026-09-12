import React, { useState } from "react";
import {
  LayoutDashboard,
  Activity,
  FolderKanban,
  Users,
  BookOpenCheck,
  Settings,
  GraduationCap,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import type { TabType } from "../types";

type SidebarProps = {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  resultCount: number;
  questionCount: number;
  groupCount: number;
  liveCount: number;
};

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  resultCount,
  questionCount,
  groupCount,
  liveCount,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { id: "dashboard" as TabType, label: "Dashboard", icon: LayoutDashboard },
    { id: "live" as TabType, label: "Jonli", icon: Activity, badge: liveCount > 0 ? String(liveCount) : null },
    { id: "groups" as TabType, label: "Guruhlar", icon: FolderKanban, badge: groupCount > 0 ? String(groupCount) : null },
    { id: "results" as TabType, label: "Natijalar", icon: Users, badge: resultCount > 0 ? String(resultCount) : null },
    { id: "questions" as TabType, label: "Savollar", icon: BookOpenCheck, badge: questionCount > 0 ? String(questionCount) : null },
    { id: "settings" as TabType, label: "Sozlamalar", icon: Settings },
  ];

  return (
    <aside className={`${isCollapsed ? "w-20" : "w-72"} bg-white border-r border-slate-200 shrink-0 h-screen sticky top-0 z-30 transition-[width] duration-500 ease-in-out will-change-[width] overflow-hidden`}>
      <div className={`p-5 border-b border-slate-100 flex items-center ${isCollapsed ? "flex-col gap-3" : "justify-between gap-3"} transition-[gap] duration-500 ease-in-out`}>
        <div className="w-10 h-10 rounded-xl bg-green-700 flex items-center justify-center text-white">
          <GraduationCap size={22} />
        </div>
        <div className={`flex-1 min-w-0 overflow-hidden transition-[opacity,max-width] duration-300 ease-in-out ${isCollapsed ? "max-w-0 opacity-0" : "max-w-[180px] opacity-100"}`}>
          <h1 className="font-bold text-base text-slate-900 tracking-tight">MONDAY</h1>
          <p className="text-[11px] text-slate-500">Admin panel</p>
        </div>
        <button
          type="button"
          onClick={() => setIsCollapsed((collapsed) => !collapsed)}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
          title={isCollapsed ? "Menyuni kengaytirish" : "Menyuni ixchamlashtirish"}
          aria-label={isCollapsed ? "Menyuni kengaytirish" : "Menyuni ixchamlashtirish"}
        >
          {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      <nav className="p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center ${isCollapsed ? "justify-center" : "justify-between"} px-3 py-2.5 rounded-xl text-sm transition-colors ${isActive ? "bg-green-700 text-white" : "text-slate-600 hover:bg-slate-50"
                }`}
              title={isCollapsed ? item.label : undefined}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} />
                <span className={`whitespace-nowrap overflow-hidden transition-[max-width,opacity] duration-300 ease-in-out ${isCollapsed ? "max-w-0 opacity-0" : "max-w-[140px] opacity-100"}`}>
                  {item.label}
                </span>
              </div>
              {item.badge && (
                <span className={`text-[10px] rounded-full transition-[opacity,transform,max-width,padding] duration-300 overflow-hidden ${isCollapsed ? "max-w-0 px-0 opacity-0 scale-75 pointer-events-none" : "max-w-10 px-1.5 py-0.5 opacity-100 scale-100"} ${isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>


    </aside>
  );
};
