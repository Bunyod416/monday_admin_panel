import React, { useState, useMemo } from "react";
import {
  Activity,
  Search,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Radio,
  FolderKanban,
  Copy,
  Check,
} from "lucide-react";
import type { Category, ExamGroup, LiveStudentTelemetry } from "../types";

type LiveMonitoringViewProps = {
  liveStudents: LiveStudentTelemetry[];
  groups: ExamGroup[];
};

export const LiveMonitoringView: React.FC<LiveMonitoringViewProps> = ({
  liveStudents,
  groups,
}) => {
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [copiedGroup, setCopiedGroup] = useState<string | null>(null);

  function copyGroupCode(code: string, e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedGroup(code);
    setTimeout(() => {
      setCopiedGroup((current) => (current === code ? null : current));
    }, 2000);
  }

  // 1. Auto-discover groups from both `groups` prop and liveStudents telemetry
  const liveGroups = useMemo(() => {
    const map = new Map<string, { code: string; name: string; count: number }>();

    // Add formally registered groups
    groups.forEach((g) => {
      const code = g.group_code.trim().toUpperCase();
      if (code) {
        map.set(code, {
          code,
          name: g.group_name || code,
          count: 0,
        });
      }
    });

    // Add telemetry groups
    liveStudents.forEach((s) => {
      const code = s.groupCode ? s.groupCode.trim().toUpperCase() : "GURUHSIz";
      if (!map.has(code)) {
        map.set(code, {
          code,
          name: code === "GURUHSIz" ? "Guruhsiz / Umumiy" : code,
          count: 0,
        });
      }
      const item = map.get(code)!;
      if (s.status !== "submitted" && s.status !== "inactive") {
        item.count += 1;
      }
    });

    return Array.from(map.values());
  }, [groups, liveStudents]);

  const filteredStudents = liveStudents.filter((s) => {
    const matchesSearch = s.studentName.toLowerCase().includes(search.toLowerCase());
    const studentGroup = (s.groupCode || "").trim().toUpperCase();
    let matchesGroup = true;

    if (selectedGroup !== "all") {
      if (selectedGroup === "GURUHSIz") {
        matchesGroup = !studentGroup || studentGroup === "GURUHSIz" || studentGroup === "UMUMIY";
      } else {
        matchesGroup = studentGroup === selectedGroup.toUpperCase();
      }
    }

    return matchesSearch && matchesGroup;
  });

  const activeCount = liveStudents.filter((s) => s.status !== "submitted" && s.status !== "inactive").length;
  const warningCount = liveStudents.filter((s) => s.status === "warning" || s.status === "blocked").length;
  const activeGroupsCount = new Set(
    liveStudents.filter((s) => s.status !== "submitted" && s.status !== "inactive" && s.groupCode).map((s) => s.groupCode.toUpperCase())
  ).size;

  const categoryBadgeColors: Record<Category, { bg: string; text: string; border: string }> = {
    HTML: { bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200" },
    CSS: { bg: "bg-green-50", text: "text-green-800", border: "border-green-200" },
    JavaScript: { bg: "bg-teal-50", text: "text-teal-800", border: "border-teal-200" },
    Python: { bg: "bg-emerald-100/70", text: "text-emerald-900", border: "border-emerald-300/80" },
  };

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* ────────────────────────────────────────────────────────
          TOP STATS SUMMARY
      ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200 shrink-0">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hozir Test Topshirmoqda</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{activeCount} nafar talaba</h3>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200 shrink-0">
              <ShieldAlert size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Shubhali Holatlar</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{warningCount} nafar ogohlantirishda</h3>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200 shrink-0">
              <Radio size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Faol Guruhlar</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{activeGroupsCount} ta guruh</h3>
            </div>
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────
          GROUP SELECTOR TABS & SEARCH BAR
      ──────────────────────────────────────────────────────── */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        {/* Horizontal Group Filter Tabs */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <FolderKanban size={14} className="text-green-700" />
              Guruh Bo'yicha Kuzatish:
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            <button
              onClick={() => setSelectedGroup("all")}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${selectedGroup === "all"
                ? "bg-green-700 text-white shadow-md shadow-green-700/20"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
            >
              <span>Barcha Guruhlar</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${selectedGroup === "all" ? "bg-white/20 text-white" : "bg-white text-slate-700 shadow-xs"
                  }`}
              >
                {activeCount}
              </span>
            </button>

            {liveGroups.map((g) => {
              const isSelected = selectedGroup.toUpperCase() === g.code.toUpperCase();
              return (
                <button
                  key={g.code}
                  onClick={() => setSelectedGroup(g.code)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer border ${isSelected
                    ? "bg-emerald-700 text-white border-emerald-700 shadow-md shadow-emerald-700/20"
                    : "bg-emerald-50/70 hover:bg-emerald-100 text-emerald-900 border-emerald-200/80"
                    }`}
                >
                  <span>{g.name}</span>
                  {g.count > 0 && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-extrabold ${isSelected ? "bg-white/25 text-white" : "bg-emerald-200/80 text-emerald-900"
                        }`}
                    >
                      {g.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Input */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Jonli talaba ismini qidirish..."
              className="w-full pl-10 pr-4 py-2 rounded-2xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-green-700/20 focus:border-green-700 transition-all"
            />
          </div>

          <span className="text-xs font-semibold text-slate-500 shrink-0">
            Ko'rsatilmoqda: <strong>{filteredStudents.length}</strong> nafar talaba
          </span>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────
          LIVE STUDENTS CARDS GRID
      ──────────────────────────────────────────────────────── */}
      {filteredStudents.length === 0 ? (
        <div className="p-16 rounded-3xl bg-white border border-dashed border-slate-300 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
            <Radio size={28} className="text-slate-400" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-800">
              {selectedGroup !== "all"
                ? `"${selectedGroup}" guruhida hozirda test topshirayotgan talaba yo'q`
                : "Hozirda jonli test topshirayotgan talaba yo'q"}
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Talabalar testni boshlashi bilanoq ularning har bir qadami, joriy savoli, progressi va qoidabuzarliklari bu yerda real-vaqtda jonli ko'rinadi.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStudents.map((student) => {
            const catStyle =
              categoryBadgeColors[student.category] || {
                bg: "bg-slate-50",
                text: "text-slate-700",
                border: "border-slate-200",
              };

            const isWarning = student.status === "warning";
            const isBlocked = student.status === "blocked";
            const isSubmitted = student.status === "submitted";
            const isInactive = student.status === "inactive";

            return (
              <div
                key={`${student.groupCode || "general"}_${student.studentName}`}
                className={`p-6 rounded-3xl bg-white border transition-all duration-300 relative overflow-hidden shadow-sm hover:shadow-md ${isBlocked
                  ? "border-rose-300 bg-rose-50/20"
                  : isWarning
                    ? "border-amber-300 bg-amber-50/20"
                    : isInactive
                      ? "border-slate-300 bg-slate-50/50"
                      : "border-slate-200 hover:border-green-300"
                  }`}
              >
                {/* Status Indicator Bar */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-green-100 text-green-800 flex items-center justify-center font-bold text-sm border border-green-200 shrink-0">
                      {student.studentName.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-base leading-snug">
                        {student.studentName}
                      </h4>
                      <div className="mt-1">
                        {student.groupCode ? (
                          <button
                            type="button"
                            onClick={(e) => copyGroupCode(student.groupCode, e)}
                            className={`px-2.5 py-0.5 rounded-md font-mono font-bold text-xs border transition-all inline-flex items-center gap-1 cursor-pointer active:scale-95 ${copiedGroup === student.groupCode
                                ? "bg-green-700 text-white border-green-700 shadow-sm"
                                : "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300"
                              }`}
                            title="Guruh kodini nusxalash"
                          >
                            {copiedGroup === student.groupCode ? (
                              <>
                                <Check size={10} className="text-white" />
                                <span>Nusxalandi!</span>
                              </>
                            ) : (
                              <>
                                <Copy size={9} className="text-emerald-700/70" />
                                <span>{student.groupCode}</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Guruhsiz</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isBlocked ? (
                      <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold flex items-center gap-1">
                        <ShieldAlert size={12} /> Bloklangan
                      </span>
                    ) : isWarning ? (
                      <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold flex items-center gap-1">
                        <AlertTriangle size={12} /> Ekrandan chiqdi
                      </span>
                    ) : isSubmitted ? (
                      <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold flex items-center gap-1">
                        <CheckCircle2 size={12} /> Yakunladi
                      </span>
                    ) : isInactive ? (
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500" /> Faol emas
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Jonli faol
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600 flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                      >
                        {student.category}
                      </span>
                      Savol: {student.questionIndex} / {student.totalQuestions}
                    </span>
                    <span className="font-extrabold text-slate-900">{student.progressPercent}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-600 to-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${student.progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Telemetry Metrics Grid */}
                <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] uppercase font-bold text-slate-500">Javob berildi</p>
                    <p className="text-sm font-black text-slate-800 mt-0.5">
                      {student.answeredCount} / {student.totalQuestions}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] uppercase font-bold text-slate-500 flex items-center justify-center gap-1">
                      <Clock size={10} /> Qolgan vaqt
                    </p>
                    <p className="text-sm font-black text-slate-800 mt-0.5">
                      {formatTime(student.remainingSeconds)}
                    </p>
                  </div>

                  <div
                    className={`p-2.5 rounded-xl border ${student.violationCount > 0
                      ? "bg-rose-50 border-rose-200 text-rose-800"
                      : "bg-slate-50 border-slate-100 text-slate-800"
                      }`}
                  >
                    <p className="text-[10px] uppercase font-bold flex items-center justify-center gap-1">
                      <AlertTriangle size={10} /> Qoidabuzarlik
                    </p>
                    <p className="text-sm font-black mt-0.5">{student.violationCount} ta</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
