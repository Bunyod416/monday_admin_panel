import React from "react";
import {
  Users,
  Award,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
} from "lucide-react";
import type { ExamResult, Question, TabType, LiveStudentTelemetry } from "../types";

type DashboardViewProps = {
  results: ExamResult[];
  questions: Question[];
  liveStudents?: LiveStudentTelemetry[];
  setActiveTab: (tab: TabType) => void;
  onInspectStudent: (result: ExamResult) => void;
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  results,
  questions,
  liveStudents: _liveStudents = [],
  setActiveTab,
  onInspectStudent,
}) => {
  const totalSubmissions = results.length;
  const avgScore = totalSubmissions
    ? Math.round(results.reduce((s, r) => s + Number(r.score), 0) / totalSubmissions)
    : 0;
  const highestScore = totalSubmissions
    ? Math.max(...results.map((r) => Number(r.score)))
    : 0;
  const totalViolations = results.reduce((s, r) => s + (r.violation_count || 0), 0);

  const htmlCount = questions.filter((q) => q.category === "HTML").length;
  const cssCount = questions.filter((q) => q.category === "CSS").length;
  const jsCount = questions.filter((q) => q.category === "JavaScript").length;
  const pyCount = questions.filter((q) => q.category === "Python").length;

  function getResultPct(r: ExamResult): number {
    const total = Number(r.total_points) || 120;
    return total > 0 ? (Number(r.score) / total) * 100 : 0;
  }

  const gradeA = results.filter((r) => getResultPct(r) >= 86).length;
  const gradeB = results.filter((r) => getResultPct(r) >= 71 && getResultPct(r) < 86).length;
  const gradeC = results.filter((r) => getResultPct(r) >= 56 && getResultPct(r) < 71).length;
  const gradeF = results.filter((r) => getResultPct(r) < 56).length;

  const recentResults = results.slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Jami Topshirganlar</span>
            <div className="w-10 h-10 rounded-2xl bg-green-50 text-green-700 flex items-center justify-center border border-green-200">
              <Users size={20} />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-4">{totalSubmissions}</p>
          <p className="text-xs text-slate-500 mt-1 font-medium">Bazada saqlangan barcha talabalar</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">O'rtacha Natija</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <TrendingUp size={20} />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-4">{avgScore} <span className="text-base font-medium text-slate-500">ball</span></p>
          <p className="text-xs text-slate-500 mt-1">Barcha guruhlar o'rtacha bali</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Eng Yuqori Ball</span>
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200">
              <Award size={20} />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-4">{highestScore} <span className="text-base font-medium text-slate-500">ball</span></p>
          <p className="text-xs text-slate-500 mt-1">Maksimal to'plangan natija</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Qoidabuzarliklar</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <AlertTriangle size={20} />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-4">{totalViolations}</p>
          <p className="text-xs text-slate-500 mt-1">Ekrandan chiqish holatlari</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <BookOpenCheck size={18} className="text-green-700" />
              Savollar bazasi
            </h3>
            <button onClick={() => setActiveTab("questions")} className="text-xs font-semibold text-green-700">
              Barchasi
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200"><span className="text-xs font-bold text-emerald-900">HTML</span><p className="text-xl font-black text-emerald-950 mt-1">{htmlCount}</p></div>
            <div className="p-3 rounded-2xl bg-green-50 border border-green-200"><span className="text-xs font-bold text-green-900">CSS</span><p className="text-xl font-black text-green-950 mt-1">{cssCount}</p></div>
            <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200"><span className="text-xs font-bold text-teal-900">JS</span><p className="text-xl font-black text-teal-950 mt-1">{jsCount}</p></div>
            <div className="p-3 rounded-2xl bg-emerald-100/80 border border-emerald-300"><span className="text-xs font-bold text-emerald-900">PY</span><p className="text-xl font-black text-emerald-950 mt-1">{pyCount}</p></div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-700" />
            Baholar
          </h3>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200"><span className="text-[10px] font-bold text-emerald-900">A</span><p className="text-lg font-black text-emerald-950">{gradeA}</p></div>
            <div className="p-2 rounded-xl bg-green-50 border border-green-200"><span className="text-[10px] font-bold text-green-900">B</span><p className="text-lg font-black text-green-950">{gradeB}</p></div>
            <div className="p-2 rounded-xl bg-teal-50 border border-teal-200"><span className="text-[10px] font-bold text-teal-900">C</span><p className="text-lg font-black text-teal-950">{gradeC}</p></div>
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200"><span className="text-[10px] font-bold text-slate-700">F</span><p className="text-lg font-black text-slate-800">{gradeF}</p></div>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Oxirgi Topshirgan Talabalar</h3>
            <p className="text-xs text-slate-500">Eng so'nggi natijalar ro'yxati</p>
          </div>
          <button
            onClick={() => setActiveTab("results")}
            className="px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-green-800 flex items-center gap-1.5 transition-colors border border-slate-200 cursor-pointer"
          >
            Barchasini ko'rish <ArrowRight size={14} />
          </button>
        </div>

        {recentResults.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            Hozircha hech qanday natija mavjud emas.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentResults.map((result) => {
              const score = Number(result.score);
              const total = Number(result.total_points) || 120;
              const pct = Math.round((score / total) * 100);
              const isPass = pct >= 60;
              const grp = result.group_code || result.answers?._meta?.group_code;

              return (
                <div
                  key={result.id}
                  className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-xl transition-colors cursor-pointer"
                  onClick={() => onInspectStudent(result)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-100 text-green-800 flex items-center justify-center font-bold text-sm border border-green-200">
                      {result.student_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{result.student_name}</p>
                      <p className="text-[11px] text-slate-500">{grp || "Umumiy"} • {new Date(result.submitted_at || result.created_at).toLocaleDateString("uz-UZ")}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold ${isPass ? "text-emerald-700" : "text-slate-700"}`}>{pct}%</span>
                    <span className="text-xs text-slate-600 font-semibold">{score}/{total}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
