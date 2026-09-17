import React, { useState, useEffect } from "react";
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
  X,
  Shield,
} from "lucide-react";
import type { TabType, AdminUser } from "../types";
import { readStorage, writeStorage } from "../lib/storage";

type SidebarProps = {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  resultCount: number;
  questionCount: number;
  groupCount: number;
  liveCount: number;
  teacherCount?: number;
  currentUser?: AdminUser | null;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
};

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  resultCount,
  questionCount,
  groupCount,
  liveCount,
  teacherCount = 0,
  currentUser,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return readStorage("monday_admin_sidebar_collapsed") === "true";
  });

  function handleToggleCollapse() {
    setIsCollapsed((prev) => {
      const next = !prev;
      writeStorage("monday_admin_sidebar_collapsed", String(next));
      return next;
    });
  }

  // Close mobile drawer on Escape key
  useEffect(() => {
    if (!isMobileOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && onCloseMobile) {
        onCloseMobile();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileOpen, onCloseMobile]);

  const navItems = [
    { id: "dashboard" as TabType, label: "Dashboard", icon: LayoutDashboard },
    { id: "live" as TabType, label: "Jonli", icon: Activity, badge: liveCount > 0 ? String(liveCount) : null },
    { id: "groups" as TabType, label: "Guruhlar", icon: FolderKanban, badge: groupCount > 0 ? String(groupCount) : null },
    { id: "results" as TabType, label: "Natijalar", icon: Users, badge: resultCount > 0 ? String(resultCount) : null },
    { id: "questions" as TabType, label: "Savollar", icon: BookOpenCheck, badge: questionCount > 0 ? String(questionCount) : null },
    // Only Super Admin can see and manage Teachers (Ustozlar)
    ...(currentUser?.role === "super_admin"
      ? [{ id: "teachers" as TabType, label: "Ustozlar", icon: Shield, badge: teacherCount > 0 ? String(teacherCount) : null }]
      : []),
    { id: "settings" as TabType, label: "Sozlamalar", icon: Settings },
  ];

  return (
    <>
      {/* ─── Mobile Backdrop Overlay ─── */}
      <div
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300 ${isMobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        onClick={onCloseMobile}
        aria-hidden="true"
      />

      {/* ─── Main Sidebar Aside ─── */}
      <aside
        className={`
          fixed top-0 bottom-0 left-0 z-50 bg-white border-r border-slate-200 flex flex-col
          transition-[width,transform] duration-300 ease-[cubic-bezier(0.2,0,0,1)]
          ${isMobileOpen ? "translate-x-0 w-72 shadow-2xl" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:h-screen lg:sticky lg:top-0 lg:z-30 lg:shadow-none
          ${isCollapsed ? "lg:w-[72px]" : "lg:w-64"}
        `}
      >
        {/* Header Branding */}
        <div className="h-16 border-b border-slate-100 px-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-[#3a7d5a] flex items-center justify-center text-white shrink-0 shadow-xs">
              <GraduationCap size={22} />
            </div>
            <div
              className={`flex flex-col min-w-0 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${isCollapsed
                ? "lg:max-w-0 lg:opacity-0 lg:-translate-x-2 overflow-hidden pointer-events-none"
                : "max-w-[150px] opacity-100 translate-x-0"
                }`}
            >
              <h1 className="font-bold text-base text-slate-900 tracking-tight leading-none">MONDAY</h1>
              <p className="text-[11px] text-slate-500 mt-1 leading-none font-medium">Admin panel</p>
            </div>
          </div>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Menyuni yopish"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="p-2.5 space-y-1.5 flex-1 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`group relative w-full flex items-center h-11 px-3 rounded-xl transition-all duration-200 cursor-pointer ${isActive
                  ? "bg-[#3a7d5a] text-white shadow-xs font-semibold"
                  : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 font-medium"
                  }`}
              >
                {/* Stable Icon Container - Never shifts */}
                <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                  <Icon
                    size={19}
                    className={isActive ? "text-white" : "text-slate-500 group-hover:text-slate-800 transition-colors"}
                  />
                </div>

                {/* Smooth Label Text */}
                <span
                  className={`ml-3 text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${isCollapsed
                    ? "lg:max-w-0 lg:opacity-0 lg:-translate-x-2"
                    : "max-w-[140px] opacity-100 translate-x-0"
                    }`}
                >
                  {item.label}
                </span>

                {/* Badge */}
                {item.badge && (
                  <span
                    className={`ml-auto text-[11px] font-bold rounded-full px-2 py-0.5 transition-all duration-300 shrink-0 ${isCollapsed
                      ? "lg:max-w-0 lg:opacity-0 lg:scale-75 lg:p-0 lg:m-0 overflow-hidden"
                      : "opacity-100 scale-100"
                      } ${isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-700 group-hover:bg-slate-200"
                      }`}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Floating Tooltip for Desktop Collapsed Mode */}
                {isCollapsed && (
                  <div className="hidden lg:flex pointer-events-none absolute left-full ml-3 z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white shadow-xl opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 items-center gap-2">
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="bg-white/25 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                        {item.badge}
                      </span>
                    )}
                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile Card */}
        {currentUser && (
          <div className="p-2.5 border-t border-slate-100 shrink-0">
            <div
              className={`flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100 group relative ${
                isCollapsed ? "justify-center" : ""
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-[#3a7d5a] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                {currentUser.full_name?.charAt(0).toUpperCase() || "A"}
              </div>

              <div
                className={`min-w-0 overflow-hidden transition-all duration-300 ${
                  isCollapsed ? "lg:max-w-0 lg:opacity-0 hidden" : "flex-1"
                }`}
              >
                <p className="text-xs font-bold text-slate-900 truncate leading-tight">
                  {currentUser.full_name}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                      currentUser.role === "super_admin"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {currentUser.role === "super_admin" ? "Super Admin" : "Ustoz"}
                  </span>
                  {currentUser.subject && (
                    <span className="text-[10px] text-slate-400 truncate">
                      • {currentUser.subject}
                    </span>
                  )}
                </div>
              </div>

              {/* Tooltip in collapsed mode */}
              {isCollapsed && (
                <div className="hidden lg:flex pointer-events-none absolute left-full ml-3 z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white shadow-xl opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 flex-col gap-0.5">
                  <span className="font-bold">{currentUser.full_name}</span>
                  <span className="text-[10px] text-emerald-400 uppercase tracking-wide font-bold">
                    {currentUser.role === "super_admin" ? "Super Admin" : "Ustoz"}
                  </span>
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom Expand / Collapse Footer (Desktop Only) */}
        <div className="hidden lg:block p-2.5 border-t border-slate-100 shrink-0">
          {isCollapsed ? (
            <button
              type="button"
              onClick={handleToggleCollapse}
              className="w-full h-10 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer group relative"
              title="Menyuni kengaytirish"
              aria-label="Menyuni kengaytirish"
            >
              <PanelLeftOpen size={19} />
              <div className="pointer-events-none absolute left-full ml-3 z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white shadow-xl opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 flex items-center gap-1">
                <span>Kengaytirish</span>
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45" />
              </div>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleToggleCollapse}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Menyuni ixchamlashtirish"
            >
              <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                <PanelLeftClose size={17} />
              </div>
              <span className="whitespace-nowrap">Ixchamlashtirish</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
