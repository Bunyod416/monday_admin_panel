import React, { useState } from "react";
import {
  Activity,
  Search,
  Filter,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Radio,
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

  const filteredStudents = liveStudents.filter((s) => {
    const matchesSearch = s.studentName.toLowerCase().includes(search.toLowerCase());
    const matchesGroup =
      selectedGroup === "all" ||
      s.groupCode.toUpperCase() === selectedGroup.toUpperCase();
    return matchesSearch && matchesGroup;
  });

  const activeCount = liveStudents.filter((s) => s.status !== "submitted").length;
  const warningCount = liveStudents.filter((s) => s.status === "warning" || s.status === "blocked").length;

  const categoryBadgeColors: Record<Category, { bg: string; text: string; border: string }> = {
    HTML: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
    CSS: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
    JavaScript: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
    Python: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  };

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Banner & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 shrink-0 relative">
              <Activity size={24} className="animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hozir Test Topshirmoqda</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{activeCount} nafar talaba</h3>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200 shrink-0">
              <ShieldAlert size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Shubhali Holatlar</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{warningCount} nafar ogohlantirishda</h3>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-md flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
              <Radio size={24} className="text-emerald-400 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-300">Jonli Stream Kanali</p>
              <p className="text-sm font-bold text-emerald-300 mt-0.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Supabase WebSockets Faol
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Talaba ismini qidirish..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-green-700/20 focus:border-green-700 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter size={16} className="text-slate-400 shrink-0" />
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-700/20 focus:border-green-700 transition-all cursor-pointer"
          >
            <option value="all">Barcha Guruhlar ({liveStudents.length})</option>
            {groups.map((g) => (
              <option key={g.group_code} value={g.group_code}>
                {g.group_name} ({g.group_code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Live Cards Grid */}
      {filteredStudents.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-dashed border-slate-300 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-400 relative">
            <Radio size={28} className="animate-pulse text-slate-400" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-800">Hozirda jonli test topshirayotgan talaba yo'q</h4>
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

            return (
              <div
                key={student.studentName}
                className={`p-6 rounded-3xl bg-white border transition-all duration-300 relative overflow-hidden shadow-sm hover:shadow-md ${
                  isBlocked
                    ? "border-rose-300 bg-rose-50/20"
                    : isWarning
                    ? "border-amber-300 bg-amber-50/20"
                    : "border-slate-200 hover:border-green-300"
                }`}
              >
                {/* Status Indicator Bar */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-2xl bg-green-100 text-green-800 flex items-center justify-center font-bold text-sm border border-green-200">
                        {student.studentName.charAt(0).toUpperCase()}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                          isBlocked ? "bg-rose-400" : isWarning ? "bg-amber-400" : "bg-emerald-400"
                        }`} />
                        <span className={`relative inline-flex rounded-full h-3 w-3 ${
                          isBlocked ? "bg-rose-500" : isWarning ? "bg-amber-500" : "bg-emerald-500"
                        }`} />
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-base leading-snug">
                        {student.studentName}
                      </h4>
                      <p className="text-xs font-semibold text-slate-500">
                        {student.groupCode ? `Guruh: ${student.groupCode}` : "Guruhsiz"}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isBlocked ? (
                      <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold flex items-center gap-1">
                        <ShieldAlert size={12} /> Bloklangan
                      </span>
                    ) : isWarning ? (
                      <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold flex items-center gap-1 animate-pulse">
                        <AlertTriangle size={12} /> Ekrandan chiqdi
                      </span>
                    ) : isSubmitted ? (
                      <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold flex items-center gap-1">
                        <CheckCircle2 size={12} /> Yakunladi
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Jonli faol
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600 flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
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

                  <div className={`p-2.5 rounded-xl border ${
                    student.violationCount > 0 ? "bg-rose-50 border-rose-200 text-rose-800" : "bg-slate-50 border-slate-100 text-slate-800"
                  }`}>
                    <p className="text-[10px] uppercase font-bold flex items-center justify-center gap-1">
                      <AlertTriangle size={10} /> Qoidabuzarlik
                    </p>
                    <p className="text-sm font-black mt-0.5">
                      {student.violationCount} ta
                    </p>
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
