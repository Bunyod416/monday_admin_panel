import React, { useState, useMemo } from "react";
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
  onDeleteGroup: (groupCode: string, deleteResults?: boolean) => Promise<void>;
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
  const [copiedRawCode, setCopiedRawCode] = useState<string | null>(null);
  const [groupToDelete, setGroupToDelete] = useState<ExamGroup | null>(null);
  const [deleteAlsoResults, setDeleteAlsoResults] = useState(true);

  function copyRawCode(code: string, e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedRawCode(code);
    setTimeout(() => {
      setCopiedRawCode((current) => (current === code ? null : current));
    }, 2000);
  }

  // Auto-discover groups from results that may not yet be formally saved in `exam_groups` table
  const allGroups = useMemo(() => {
    const map = new Map<string, ExamGroup>();

    // 1. Registered groups
    groups.forEach((g) => {
      const code = g.group_code.trim().toUpperCase();
      if (code) {
        map.set(code, {
          ...g,
          group_code: code,
        });
      }
    });

    // 2. Unregistered groups found in results
    results.forEach((r) => {
      const rawCode = r.group_code || r.answers?._meta?.group_code;
      if (rawCode) {
        const code = String(rawCode).trim().toUpperCase();
        if (!map.has(code)) {
          map.set(code, {
            id: `discovered_${code}`,
            group_name: code,
            group_code: code,
            counts: { HTML: 30, CSS: 30, JavaScript: 30, Python: 30 },
            duration_minutes: Number(r.duration_minutes) || 60,
            max_students: 30,
            is_active: true,
            created_at: r.created_at || r.submitted_at,
          });
        }
      }
    });

    return Array.from(map.values());
  }, [groups, results]);

  const filtered = allGroups.filter((g) => {
    return (
      g.group_name.toLowerCase().includes(search.toLowerCase()) ||
      g.group_code.toLowerCase().includes(search.toLowerCase())
    );
  });

  function getStudentCount(groupCode: string): number {
    const clean = groupCode.trim().toUpperCase();
    return results.filter((r) => {
      const code = (r.group_code || r.answers?._meta?.group_code || "").toString().trim().toUpperCase();
      return code === clean;
    }).length;
  }

  function copyGroupLink(code: string) {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:5174";
    const studentUrl = `${origin}/?group=${code}`;
    navigator.clipboard.writeText(studentUrl);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Action Bar */}
      <div className="p-3 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-sm">
        <div className="relative w-full sm:max-w-sm">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Guruh nomi yoki kodini qidirish..."
            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-green-600 rounded-xl pl-10 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors"
          />
        </div>

        <button
          onClick={onAddGroup}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-700 hover:bg-green-800 text-white font-bold text-xs shadow-sm transition-all cursor-pointer whitespace-nowrap"
        >
          <Plus size={16} />
          <span>Yangi Guruh Yaratish</span>
        </button>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filtered.length === 0 ? (
          <div className="col-span-full p-16 rounded-3xl bg-white border border-slate-200 text-center text-slate-400">
            Hozircha hech qanday guruh mavjud emas. Yangi guruh yarating!
          </div>
        ) : (
          filtered.map((g) => {
            const count = getStudentCount(g.group_code);
            const max = g.max_students || 30;
            const isCopied = copiedCode === g.group_code;
            const totalQ = Object.values(g.counts || {}).reduce((s, n) => s + (Number(n) || 0), 0);

            return (
              <div
                key={g.group_code}
                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-900 text-sm">{g.group_name}</h3>
                      <button
                        type="button"
                        onClick={(e) => copyRawCode(g.group_code, e)}
                        className={`px-2 py-0.5 rounded-md font-mono font-extrabold text-[11px] border transition-all flex items-center gap-1 cursor-pointer active:scale-95 ${copiedRawCode === g.group_code
                            ? "bg-green-700 text-white border-green-700 shadow-sm"
                            : "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 hover:shadow-xs"
                          }`}
                        title="Guruh kodini nusxalash uchun 1 marta bosing"
                      >
                        {copiedRawCode === g.group_code ? (
                          <>
                            <Check size={11} className="text-white shrink-0" />
                            <span>Nusxalandi!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={9} className="text-emerald-700/70 shrink-0" />
                            <span>{g.group_code}</span>
                          </>
                        )}
                      </button>
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full font-bold border flex items-center gap-1 ${g.is_active
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${g.is_active ? "bg-emerald-500" : "bg-slate-400"}`} />
                        <span>{g.is_active ? "Faol" : "Yopilgan"}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1"><Users size={12} /> {count}/{max} talaba</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> {g.duration_minutes} daqiqa</span>
                      <span className="flex items-center gap-1"><BookOpen size={12} /> {totalQ} savol</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onToggleGroupStatus(g.group_code, g.is_active)}
                    className={`p-2 rounded-xl border transition-colors cursor-pointer ${g.is_active
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200"
                        : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
                      }`}
                    title={g.is_active ? "Imtihonni yopish (talaba kira olmaydi)" : "Imtihonni ochish (faollashtirish)"}
                  >
                    <Power size={15} />
                  </button>
                </div>

                {/* Card Actions */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => copyGroupLink(g.group_code)}
                    className={`flex-1 py-2 rounded-xl font-bold text-[11px] flex items-center justify-center gap-2 border transition-all cursor-pointer ${isCopied
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200"
                      }`}
                  >
                    {isCopied ? <Check size={14} className="text-emerald-700" /> : <Copy size={14} />}
                    <span>{isCopied ? "Havola nusxalandi" : "Talabalar havolasini nusxalash"}</span>
                  </button>

                  <button
                    onClick={() => onViewResultsForGroup(g.group_code)}
                    className="py-2 px-3 rounded-xl bg-green-50 hover:bg-green-100 text-green-800 border border-green-200 text-[11px] font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <ExternalLink size={13} />
                    <span>Natijalar ({count})</span>
                  </button>
                  <button
                    onClick={() => {
                      setDeleteAlsoResults(true);
                      setGroupToDelete(g);
                    }}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 transition-colors cursor-pointer"
                    title="Guruhni butunlay o'chirish"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ────────────────────────────────────────────────────────
          ANIMATED DELETE CONFIRMATION MODAL FOR GROUPS
      ──────────────────────────────────────────────────────── */}
      {groupToDelete && (() => {
        const studentCnt = getStudentCount(groupToDelete.group_code);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 transform transition-all animate-scale-up space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
                  <Trash2 size={24} />
                </div>
                <button
                  onClick={() => setGroupToDelete(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
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
                  <button
                    type="button"
                    onClick={() => copyRawCode(groupToDelete.group_code)}
                    className="font-mono font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200 cursor-pointer flex items-center gap-1"
                    title="Kodni nusxalash"
                  >
                    {copiedRawCode === groupToDelete.group_code ? (
                      <>
                        <Check size={11} className="text-emerald-700" />
                        <span>Nusxalandi!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={10} className="text-emerald-600" />
                        <span>{groupToDelete.group_code}</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-slate-500">
                  {groupToDelete.duration_minutes} daqiqa • {studentCnt} ta topshirgan talaba mavjud
                </p>
              </div>

              {/* Option to also delete student results in this group */}
              {studentCnt > 0 && (
                <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-rose-50/70 border border-rose-200 text-xs text-rose-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={deleteAlsoResults}
                    onChange={(e) => setDeleteAlsoResults(e.target.checked)}
                    className="mt-0.5 rounded border-rose-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                  />
                  <span>
                    Ushbu guruhdagi barcha <strong>{studentCnt} ta</strong> o'quvchining natijalarini ham bazadan butunlay o'chirish
                  </span>
                </label>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setGroupToDelete(null)}
                  className="flex-1 py-3 rounded-2xl border border-slate-200 font-bold text-xs text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Bekor Qilish
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (groupToDelete) {
                      await onDeleteGroup(groupToDelete.group_code, deleteAlsoResults);
                      setGroupToDelete(null);
                    }
                  }}
                  className="flex-1 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Trash2 size={15} />
                  <span>Ha, O'chirilsin</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
