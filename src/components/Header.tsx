import React from "react";
import { RefreshCw, LogOut, Menu, ArrowLeft } from "lucide-react";
import type { TabType, AdminUser } from "../types";

type HeaderProps = {
  activeTab: TabType;
  onRefresh: () => void;
  isRefreshing: boolean;
  onLogout?: () => void;
  onOpenMobileMenu?: () => void;
  inspectingStudentName?: string;
  onBackFromInspect?: () => void;
  currentUser?: AdminUser | null;
};

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onRefresh,
  isRefreshing,
  onLogout,
  onOpenMobileMenu,
  inspectingStudentName,
  onBackFromInspect,
  currentUser,
}) => {
  const titles: Record<TabType, { title: string; subtitle: string }> = {
    dashboard: {
      title: "Dashboard",
      subtitle: "Imtihon statistikasi va talabalar natijalari",
    },
    live: {
      title: "Jonli Kuzatuv",
      subtitle: "Real-vaqtda test topshirayotgan talabalar nazorati",
    },
    groups: {
      title: "Guruhlar",
      subtitle: "Imtihon guruhlari va maxsus havolalar",
    },
    results: {
      title: "Natijalar",
      subtitle: "Topshirilgan barcha imtihon natijalari",
    },
    questions: {
      title: "Savollar Bazasi",
      subtitle: "Bazada mavjud savollar boshqaruvi",
    },
    teachers: {
      title: "Ustozlar (Adminlar)",
      subtitle: "Super Admin tomonidan ustozlar hisoblarini boshqarish",
    },
    settings: {
      title: "Sozlamalar",
      subtitle: "Imtihon parametrlari va xavfsizlik qoidalari",
    },
  };

  const current = titles[activeTab] || titles.dashboard;

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3 min-w-0">
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 -ml-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            title="Menyuni ochish"
            aria-label="Menyuni ochish"
          >
            <Menu size={20} />
          </button>
        )}

        {inspectingStudentName ? (
          <div className="flex items-center gap-2.5 min-w-0">
            {onBackFromInspect && (
              <button
                type="button"
                onClick={onBackFromInspect}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer shrink-0"
                title="Ro'yxatga qaytish"
              >
                <ArrowLeft size={14} />
                <span>Orqaga</span>
              </button>
            )}
            <div className="min-w-0">
              <h2 className="text-base lg:text-lg font-bold text-slate-900 tracking-tight truncate">
                {inspectingStudentName}
              </h2>
              <p className="text-[11px] text-slate-500 leading-none mt-0.5">Batafsil imtihon natijalari tahlili</p>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-base lg:text-lg font-bold text-slate-900 tracking-tight">{current.title}</h2>
            <p className="text-[11px] text-slate-500 leading-none mt-0.5">{current.subtitle}</p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {currentUser && (
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="w-6 h-6 rounded-lg bg-[#3a7d5a] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
              {currentUser.full_name?.charAt(0).toUpperCase() || "A"}
            </div>
            <div className="text-left leading-tight">
              <p className="text-xs font-bold text-slate-800 truncate max-w-[130px]">{currentUser.full_name}</p>
              <span className="text-[9px] font-bold text-emerald-700 uppercase">
                {currentUser.role === "super_admin" ? "Super Admin" : "Ustoz"}
              </span>
            </div>
          </div>
        )}

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200 transition-all disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw size={14} className={isRefreshing ? "animate-spin text-green-700" : "text-slate-500"} />
          <span>Yangilash</span>
        </button>

        {onLogout && (
          <button
            onClick={onLogout}
            className="p-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 transition-colors cursor-pointer"
            title="Admin panelidan chiqish"
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </header>
  );
};
