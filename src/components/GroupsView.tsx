import React, { useState } from "react";
import {
  Plus,
  Search,
  Copy,
  Check,
  Power,
  Trash2,
  Users,
  Clock,
  ExternalLink,
  BookOpen,
  X,
} from "lucide-react";
import type { ExamGroup, ExamResult } from "../types";

type GroupsViewProps = {
  groups: ExamGroup[];
  results: ExamResult[];
  onAddGroup: () => void;
  onToggleGroupStatus: (groupCode: string, currentStatus: boolean) => Promise<void>;
  onDeleteGroup: (groupCode: string) => Promise<void>;
  onViewResultsForGroup: (groupCode: string) => void;
};

export const GroupsView: React.FC<GroupsViewProps> = ({
  groups,
  results,
  onAddGroup,
  onToggleGroupStatus,
  onDeleteGroup,
  onViewResultsForGroup,
}) => {
  const [search, setSearch] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [groupToDelete, setGroupToDelete] = useState<ExamGroup | null>(null);

  const filtered = groups.filter((g) => {
    return (
      g.group_name.toLowerCase().includes(search.toLowerCase()) ||
      g.group_code.toLowerCase().includes(search.toLowerCase())
    );
  });

  function getStudentCount(groupCode: string): number {
    return results.filter((r) => (r.group_code || "").toUpperCase() === groupCode.toUpperCase()).length;
  }

  function copyGroupLink(code: string) {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:5173";
    const studentUrl = `${origin}/?group=${code}`;
    navigator.clipboard.writeText(studentUrl);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Stat Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Jami Guruhlar</span>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{groups.length}</p>
        </div>
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Faol Imtihonlar</span>
          <p className="text-3xl font-extrabold text-emerald-700 mt-2">
            {groups.filter((g) => g.is_active).length}
          </p>
        </div>
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Guruhlarda Topshirganlar</span>
          <p className="text-3xl font-extrabold text-blue-700 mt-2">
            {results.filter((r) => !!r.group_code).length} <span className="text-sm font-normal text-slate-400">talaba</span>
          </p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:w-80">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Guruh nomi yoki kodini qidirish..."
            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-green-600 rounded-2xl pl-11 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors"
          />
        </div>

        <button
          onClick={onAddGroup}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-green-700 hover:bg-green-800 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
        >
          <Plus size={16} />
          <span>Yangi Guruh Yaratish</span>
        </button>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.length === 0 ? (
          <div className="col-span-full p-16 rounded-3xl bg-white border border-slate-200 text-center text-slate-400">
            Hozircha hech qanday guruh mavjud emas. Yangi guruh yarating!
          </div>
        ) : (
          filtered.map((g) => {
            const count = getStudentCount(g.group_code);
            const max = g.max_students || 30;
            const pct = Math.min(100, Math.round((count / max) * 100));
            const isCopied = copiedCode === g.group_code;
            const totalQ = Object.values(g.counts || {}).reduce((s, n) => s + (n || 0), 0);

            return (
              <div
                key={g.group_code}
                className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{g.group_name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-800 font-mono font-extrabold text-xs border border-purple-200">
                          {g.group_code}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${
                          g.is_active
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}>
                          {g.is_active ? "● Faol" : "○ Yopilgan"}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onToggleGroupStatus(g.group_code, g.is_active)}
                      className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                        g.is_active
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200"
                          : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
                      }`}
                      title={g.is_active ? "Imtihonni yopish (talaba kira olmaydi)" : "Imtihonni ochish (faollashtirish)"}
                    >
                      <Power size={15} />
                    </button>
                  </div>

                  {/* Student Capacity Progress Bar */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium flex items-center gap-1">
                        <Users size={13} className="text-green-700" /> Talabalar sig'imi:
                      </span>
                      <span className="font-bold text-slate-900">
                        {count} / {max} talaba
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          pct >= 100 ? "bg-rose-500" : pct >= 70 ? "bg-amber-500" : "bg-green-600"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Specs Info */}
                  <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Clock size={13} className="text-slate-400" />
                      <span>{g.duration_minutes} daqiqa</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <BookOpen size={13} className="text-slate-400" />
                      <span>{totalQ} ta savol</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => copyGroupLink(g.group_code)}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                      isCopied
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200"
                    }`}
                  >
                    {isCopied ? <Check size={14} className="text-emerald-700" /> : <Copy size={14} />}
                    <span>{isCopied ? "Havola Nusxalandi! ✅" : "Talabalar Havolasini Nusxalash"}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewResultsForGroup(g.group_code)}
                      className="flex-1 py-2 rounded-xl bg-green-50 hover:bg-green-100 text-green-800 border border-green-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <ExternalLink size={13} />
                      <span>Natijalar ({count})</span>
                    </button>
                    <button
                      onClick={() => setGroupToDelete(g)}
                      className="p-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 transition-colors cursor-pointer"
                      title="O'chirish"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    
      {/* ────────────────────────────────────────────────────────
          BEAUTIFUL ANIMATED DELETE CONFIRMATION MODAL FOR GROUPS
      ──────────────────────────────────────────────────────── */}
      {groupToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 transform transition-all animate-scale-up space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
                <Trash2 size={24} />
              </div>
              <button
                onClick={() => setGroupToDelete(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Guruhni o'chirishni xohlaysizmi?
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Ushbu guruh bazadan butunlay o'chiriladi. Talabalar ushbu guruh kodi orqali imtihonga kira olmaydilar.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-sm">{groupToDelete.group_name}</span>
                <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                  {groupToDelete.group_code}
                </span>
              </div>
              <p className="text-slate-500">{groupToDelete.duration_minutes} daqiqa • {groupToDelete.max_students} talaba sig'imi</p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setGroupToDelete(null)}
                className="flex-1 py-3 rounded-2xl border border-slate-200 font-bold text-xs text-slate-700 hover:bg-slate-50 transition"
              >
                Bekor Qilish
              </button>
              <button
                type="button"
                onClick={() => {
                  if (groupToDelete) {
                    onDeleteGroup(groupToDelete.group_code);
                    setGroupToDelete(null);
                  }
                }}
                className="flex-1 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition flex items-center justify-center gap-1.5"
              >
                <Trash2 size={15} />
                <span>Ha, O'chirilsin</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
