import React from "react";
import { RefreshCw, LogOut } from "lucide-react";
import type { TabType } from "../types";

type HeaderProps = {
  activeTab: TabType;
  onRefresh: () => void;
  isRefreshing: boolean;
  onLogout?: () => void;
};

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onRefresh,
  isRefreshing,
  onLogout,
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
    settings: {
      title: "Sozlamalar",
      subtitle: "Imtihon parametrlari va xavfsizlik qoidalari",
    },
  };

  const current = titles[activeTab];

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h2 className="text-base lg:text-lg font-bold text-slate-900 tracking-tight">{current.title}</h2>
        <p className="text-[11px] text-slate-500 leading-none mt-0.5">{current.subtitle}</p>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">


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
