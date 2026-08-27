import React, { useMemo, useState } from "react";
import {
  Users,
  Award,
  AlertTriangle,
  TrendingUp,
  Clock,
  ArrowRight,
  Activity,
  FolderKanban,
  BookOpenCheck,
  CheckCircle2,
  Copy,
  Check,
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
  liveStudents = [],
  setActiveTab,
  onInspectStudent,
}) => {
  const [copiedGroup, setCopiedGroup] = useState<string | null>(null);

  function copyGroupCode(code: string, e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedGroup(code);
    setTimeout(() => {
      setCopiedGroup((current) => (current === code ? null : current));
    }, 2000);
  }
  const activeTakingCount = liveStudents.filter((s) => s.status !== "submitted").length;
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

  // Group breakdown in Dashboard
  const groupStats = useMemo(() => {
    const map = new Map<string, { code: string; count: number; totalScore: number }>();
    results.forEach((r) => {
      const code = (r.group_code || r.answers?._meta?.group_code || "Umumiy").toString().trim().toUpperCase();
      if (!map.has(code)) {
        map.set(code, { code, count: 0, totalScore: 0 });
      }
      const item = map.get(code)!;
      item.count += 1;
      item.totalScore += Number(r.score || 0);
    });

    return Array.from(map.values())
      .map((g) => ({
        ...g,
        avg: g.count > 0 ? Math.round(g.totalScore / g.count) : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [results]);

  return (
    <div className="space-y-8">
      {activeTakingCount > 0 && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-900 via-green-900 to-emerald-950 text-white shadow-xl border border-emerald-800 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-700/80 border border-emerald-500 flex items-center justify-center">
              <Activity size={20} className="text-emerald-200" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-emerald-100 flex items-center gap-2">
                Hozir {activeTakingCount} nafar talaba test topshirmoqda
              </h4>
              <p className="text-xs text-emerald-200/80 mt-0.5">
                {liveStudents.map((s) => `${s.studentName} (${s.groupCode || 'Guruhsiz'})`).join(", ")}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab("live")}
            className="px-4 py-2 rounded-xl bg-white text-emerald-900 font-bold text-xs shadow-md hover:bg-emerald-50 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            Jonli monitoringni ochish <ArrowRight size={14} />
          </button>
        </div>
      )}


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

      {/* Guruhlar Kesimidagi Qisqacha Taqsimot */}
      {groupStats.length > 0 && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <FolderKanban size={18} className="text-green-700" />
                Guruhlar Bo'yicha Natijalar Taqsimoti ({groupStats.length} ta guruh)
              </h3>
              <p className="text-xs text-slate-500">Har bir guruhning topshirgan talabalari soni va o'rtacha bali</p>
            </div>
            <button
              onClick={() => setActiveTab("results")}
              className="text-xs font-semibold text-green-700 hover:text-green-800 flex items-center gap-1 cursor-pointer"
            >
              Natijalarda ko'rish <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {groupStats.map((g) => (
              <div
                key={g.code}
                onClick={() => setActiveTab("results")}
                className="p-4 rounded-2xl bg-emerald-50/50 hover:bg-emerald-100/70 border border-emerald-200/70 transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-emerald-900 bg-emerald-200/70 px-2 py-0.5 rounded-md">
                    {g.code}
                  </span>
                  <span className="text-xs font-bold text-emerald-700">
                    O'rtacha: {g.avg} b
                  </span>
                </div>
                <p className="text-xl font-black text-emerald-950 mt-2">
                  {g.count} <span className="text-xs font-normal text-slate-500">talaba</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Savollar Bazasi & Baholar Taqsimoti Paneli */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Savollar Bazasi */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <BookOpenCheck size={18} className="text-green-700" />
              Savollar Bazasi Taqsimoti ({questions.length} ta savol)
            </h3>
            <button
              onClick={() => setActiveTab("questions")}
              className="text-xs font-semibold text-green-700 hover:text-green-800 flex items-center gap-1 cursor-pointer"
            >
              Savollarni ko'rish <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200">
              <span className="text-xs font-bold text-emerald-900">HTML</span>
              <p className="text-xl font-black text-emerald-950 mt-1">{htmlCount} ta</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-green-50/80 border border-green-200">
              <span className="text-xs font-bold text-green-900">CSS</span>
              <p className="text-xl font-black text-green-950 mt-1">{cssCount} ta</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-teal-50/80 border border-teal-200">
              <span className="text-xs font-bold text-teal-900">JavaScript</span>
              <p className="text-xl font-black text-teal-950 mt-1">{jsCount} ta</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-100/70 border border-emerald-300">
              <span className="text-xs font-bold text-emerald-900">Python</span>
              <p className="text-xl font-black text-emerald-950 mt-1">{pyCount} ta</p>
            </div>
          </div>
        </div>

        {/* Baholar Ko'rsatkichi */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-700" />
            Natijalar Sifati va Baholar Taqsimoti
          </h3>

          <div className="grid grid-cols-4 gap-2.5 pt-1 text-center">
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
              <span className="text-xs font-bold text-emerald-900">A (86-100%)</span>
              <p className="text-xl font-black text-emerald-950 mt-1">{gradeA}</p>
            </div>
            <div className="p-3 rounded-2xl bg-green-50 border border-green-200">
              <span className="text-xs font-bold text-green-900">B (71-85%)</span>
              <p className="text-xl font-black text-green-950 mt-1">{gradeB}</p>
            </div>
            <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200">
              <span className="text-xs font-bold text-teal-900">C (56-70%)</span>
              <p className="text-xl font-black text-teal-950 mt-1">{gradeC}</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-700">F (0-55%)</span>
              <p className="text-xl font-black text-slate-800 mt-1">{gradeF}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Row: Recent submissions with Group Badges */}
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
                  className="py-4 flex items-center justify-between hover:bg-slate-50 px-3 rounded-2xl transition-colors cursor-pointer"
                  onClick={() => onInspectStudent(result)}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-green-100 text-green-800 flex items-center justify-center font-bold text-sm border border-green-200 shrink-0">
                      {result.student_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{result.student_name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {grp ? (
                          <button
                            type="button"
                            onClick={(e) => copyGroupCode(grp, e)}
                            className={`px-2 py-0.5 rounded-md font-mono font-bold text-[11px] border transition-all flex items-center gap-1 cursor-pointer active:scale-95 ${copiedGroup === grp
                                ? "bg-green-700 text-white border-green-700 shadow-sm"
                                : "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300"
                              }`}
                            title="Guruh kodini nusxalash"
                          >
                            {copiedGroup === grp ? (
                              <>
                                <Check size={10} className="text-white" />
                                <span>Nusxalandi!</span>
                              </>
                            ) : (
                              <>
                                <Copy size={9} className="text-emerald-700/70" />
                                <span>{grp}</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Umumiy</span>
                        )}
                        <span className="text-slate-300">•</span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock size={11} />
                          {new Date(result.submitted_at || result.created_at).toLocaleString("uz-UZ")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {result.violation_count > 0 && (
                      <span className="px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-1">
                        <AlertTriangle size={12} />
                        {result.violation_count} ta qoidabuzarlik
                      </span>
                    )}

                    <div className="text-right">
                      <p className={`text-base font-extrabold ${isPass ? "text-emerald-600" : "text-slate-700"}`}>
                        {score} / {total}
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium">{pct}%</p>
                    </div>

                    <button className="px-3.5 py-1.5 rounded-xl bg-green-50 hover:bg-green-100 text-green-800 border border-green-200 text-xs font-semibold transition-colors cursor-pointer">
                      Ko'rish
                    </button>
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
