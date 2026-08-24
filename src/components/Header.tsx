import React from "react";
import { RefreshCw } from "lucide-react";
import type { TabType } from "../types";

type HeaderProps = {
  activeTab: TabType;
  onRefresh: () => void;
  isRefreshing: boolean;
  isRealtimeConnected: boolean;
};

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onRefresh,
  isRefreshing,
  isRealtimeConnected,
}) => {
  const titles: Record<TabType, { title: string; subtitle: string }> = {
    dashboard: {
      title: "Umumiy Ko'rsatkichlar",
      subtitle: "Imtihon statistikasi va talabalar natijalari real-vaqtdagi jonli tahlili",
    },
    groups: {
      title: "Guruhlar & Maxsus Havolalar",
      subtitle: "Yangi guruh yaratish, limit (1-30 talaba) belgilash va havola ulashish",
    },
    results: {
      title: "Talabalar Natijalari & Monitoring",
      subtitle: "Barcha topshirilgan ishlarni real-vaqtda chuqur tekshirish",
    },
    questions: {
      title: "Savollar Boshqaruvi",
      subtitle: "Bazada mavjud savollarni ko'rish, yangi qo'shish va tahrirlash",
    },
    settings: {
      title: "Imtihon Sozlamalari",
      subtitle: "Savollar soni, imtihon vaqti va xavfsizlik qoidalarini sozlash",
    },
  };

  const current = titles[activeTab];

  return (
    <header className="h-20 bg-white/90 backdrop-blur-md border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-20 shadow-sm">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">{current.title}</h2>
        <p className="text-xs text-slate-500 mt-0.5">{current.subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Realtime Live Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 shadow-sm">
          <span className="relative flex h-2 w-2">
            {isRealtimeConnected && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            )}
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
          </span>
          <span>Jonli Realtime</span>
        </div>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 transition-all hover:border-slate-300 shadow-sm disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw size={14} className={isRefreshing ? "animate-spin text-green-700" : "text-slate-500"} />
          <span>Yangilash</span>
        </button>
      </div>
    </header>
  );
};
