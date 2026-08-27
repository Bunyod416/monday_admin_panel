import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Download,
  AlertTriangle,
  Clock,
  Eye,
  Trash2,
  CheckCircle,
  X,
  Users,
  Award,
  TrendingUp,
  FolderKanban,
  CheckCircle2,
  Filter,
} from "lucide-react";
import type { ExamResult, ExamGroup } from "../types";

type ResultsViewProps = {
  results: ExamResult[];
  groups?: ExamGroup[];
  selectedGroupFilter?: string;
  onInspectStudent: (result: ExamResult) => void;
  onDeleteResult: (id: number) => void;
};

export const ResultsView: React.FC<ResultsViewProps> = ({
  results,
  groups = [],
  selectedGroupFilter = "all",
  onInspectStudent,
  onDeleteResult,
}) => {
  const [search, setSearch] = useState("");
  const [filterScore, setFilterScore] = useState<string>("all");
  const [filterGroup, setFilterGroup] = useState<string>(selectedGroupFilter);
  const [sortBy, setSortBy] = useState<"time" | "score" | "name" | "violations">("time");

  useEffect(() => {
    setFilterGroup(selectedGroupFilter);
  }, [selectedGroupFilter]);

  // State for animated delete confirmation modal
  const [itemToDelete, setItemToDelete] = useState<ExamResult | null>(null);

  // Helper to extract total points safely
  function getTotalPoints(r: ExamResult): number {
    if (Number(r.total_points) > 0) return Number(r.total_points);
    if (r.category_order) {
      const sum = Object.values(r.category_order).reduce(
        (acc: number, arr: any) => acc + (Array.isArray(arr) ? arr.length : 0),
        0
      );
      if (sum > 0) return sum;
    }
    const ansKeys = Object.keys(r.answers || {}).filter(
      (k) => k !== "_meta" && !isNaN(Number(k))
    );
    if (ansKeys.length > 0) return ansKeys.length;
    return 120;
  }

  // 1. DYNAMIC AUTO-DISCOVERY OF ALL GROUPS (From groups table + all results)
  const discoveredGroups = useMemo(() => {
    const groupMap = new Map<string, { code: string; name: string; count: number; isActive?: boolean }>();

    // Add formally registered groups
    groups.forEach((g) => {
      const code = g.group_code.trim().toUpperCase();
      if (code) {
        groupMap.set(code, {
          code,
          name: g.group_name || code,
          count: 0,
          isActive: g.is_active,
        });
      }
    });

    // Add groups from results (auto-discover any unlisted groups)
    results.forEach((r) => {
      const rawCode = r.group_code || r.answers?._meta?.group_code;
      const code = rawCode ? String(rawCode).trim().toUpperCase() : "GURUHSIz";
      if (!groupMap.has(code)) {
        groupMap.set(code, {
          code,
          name: code === "GURUHSIz" ? "Guruhsiz / Umumiy" : code,
          count: 0,
          isActive: true,
        });
      }
      const item = groupMap.get(code)!;
      item.count += 1;
    });

    return Array.from(groupMap.values()).sort((a, b) => b.count - a.count);
  }, [groups, results]);

  // 2. Filter and sort results
  const filtered = useMemo(() => {
    return results
      .filter((r) => {
        const nameMatches = r.student_name.toLowerCase().includes(search.toLowerCase());
        const score = Number(r.score);
        const total = getTotalPoints(r);
        const pct = total > 0 ? (score / total) * 100 : 0;

        let scoreMatches = true;
        if (filterScore === "a") scoreMatches = pct >= 86;
        else if (filterScore === "b") scoreMatches = pct >= 71 && pct < 86;
        else if (filterScore === "c") scoreMatches = pct >= 56 && pct < 71;
        else if (filterScore === "f") scoreMatches = pct < 56;
        else if (filterScore === "violations") scoreMatches = (r.violation_count || 0) > 0;

        let groupMatches = true;
        if (filterGroup !== "all") {
          const rGroup = (r.group_code || r.answers?._meta?.group_code || "").toString().trim().toUpperCase();
          if (filterGroup === "GURUHSIz") {
            groupMatches = !rGroup || rGroup === "GURUHSIz" || rGroup === "UMUMIY";
          } else {
            groupMatches = rGroup === filterGroup.toUpperCase();
          }
        }

        return nameMatches && scoreMatches && groupMatches;
      })
      .sort((a, b) => {
        if (sortBy === "score") return Number(b.score) - Number(a.score);
        if (sortBy === "violations") return (b.violation_count || 0) - (a.violation_count || 0);
        if (sortBy === "name") return a.student_name.localeCompare(b.student_name);
        return new Date(b.submitted_at || b.created_at).getTime() - new Date(a.submitted_at || a.created_at).getTime();
      });
  }, [results, search, filterScore, filterGroup, sortBy]);

  // 3. Selected Group Metrics Summary
  const groupMetrics = useMemo(() => {
    if (filtered.length === 0) {
      return { total: 0, avgScore: 0, avgPct: 0, passCount: 0, highestScore: 0, violationTotal: 0 };
    }
    const total = filtered.length;
    const totalScore = filtered.reduce((s, r) => s + Number(r.score || 0), 0);
    const avgScore = Math.round(totalScore / total);
    const highestScore = Math.max(...filtered.map((r) => Number(r.score || 0)));
    const violationTotal = filtered.reduce((s, r) => s + Number(r.violation_count || 0), 0);

    const passCount = filtered.filter((r) => {
      const tot = getTotalPoints(r);
      return tot > 0 ? (Number(r.score) / tot) * 100 >= 60 : false;
    }).length;

    const avgPct = Math.round((passCount / total) * 100);

    return { total, avgScore, avgPct, passCount, highestScore, violationTotal };
  }, [filtered]);

  function exportCSV() {
    if (filtered.length === 0) return;
    const headers = ["ID", "Talaba Ismi", "Guruh Kodi", "To'plagan Ball", "Jami Ball", "Foiz", "Qoidabuzarlik", "Topshirilgan Vaqt"];
    const rows = filtered.map((r) => {
      const score = Number(r.score) || 0;
      const total = getTotalPoints(r);
      const pct = total > 0 ? Math.round((score / total) * 100) : 0;
      const grp = r.group_code || r.answers?._meta?.group_code || "Umumiy";
      const time = new Date(r.submitted_at || r.created_at).toLocaleString("uz-UZ");
      return [r.id, `"${r.student_name}"`, `"${grp}"`, score, total, `"${pct}%"`, r.violation_count || 0, `"${time}"`].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const groupNameStr = filterGroup === "all" ? "barcha_guruhlar" : filterGroup;
    link.setAttribute("download", `natijalar_${groupNameStr}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handleConfirmDelete() {
    if (itemToDelete) {
      onDeleteResult(itemToDelete.id);
      setItemToDelete(null);
    }
  }

  // Find active group details
  const currentActiveGroup = discoveredGroups.find((g) => g.code === filterGroup);

  return (
    <div className="space-y-6">
      {/* ────────────────────────────────────────────────────────
          1. GROUP SELECTOR TABS / PILLS BAR
      ──────────────────────────────────────────────────────── */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <FolderKanban size={15} className="text-green-700" />
            Guruhlar Bo'yicha Saralash:
          </span>
          <span className="text-xs text-slate-400 font-medium">
            Jami: {results.length} ta natija
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => setFilterGroup("all")}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
              filterGroup === "all"
                ? "bg-green-700 text-white shadow-md shadow-green-700/20"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            <span>Barcha Guruhlar</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                filterGroup === "all" ? "bg-white/20 text-white" : "bg-white text-slate-700 shadow-xs"
              }`}
            >
              {results.length}
            </span>
          </button>

          {discoveredGroups.map((g) => {
            const isSelected = filterGroup.toUpperCase() === g.code.toUpperCase();
            return (
              <button
                key={g.code}
                onClick={() => setFilterGroup(g.code)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer border ${
                  isSelected
                    ? "bg-green-700 text-white border-green-700 shadow-md shadow-green-700/20"
                    : "bg-emerald-50/70 hover:bg-emerald-100 text-emerald-900 border-emerald-200/80"
                }`}
              >
                <span>{g.name}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-extrabold ${
                    isSelected ? "bg-white/25 text-white" : "bg-emerald-200/80 text-emerald-900"
                  }`}
                >
                  {g.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────
          2. GROUP SUMMARY STATS BAR
      ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-green-50 text-green-700 flex items-center justify-center border border-green-200 shrink-0">
            <Users size={20} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              {filterGroup === "all" ? "Jami Topshirganlar" : "Guruh Talabalari"}
            </span>
            <p className="text-2xl font-black text-slate-900 mt-0.5">
              {groupMetrics.total} <span className="text-xs font-normal text-slate-400">nafar</span>
            </p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200 shrink-0">
            <TrendingUp size={20} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              O'rtacha Ball
            </span>
            <p className="text-2xl font-black text-emerald-700 mt-0.5">
              {groupMetrics.avgScore} <span className="text-xs font-normal text-slate-400">ball</span>
            </p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200 shrink-0">
            <Award size={20} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Eng Yuqori Ball
            </span>
            <p className="text-2xl font-black text-teal-700 mt-0.5">
              {groupMetrics.highestScore} <span className="text-xs font-normal text-slate-400">ball</span>
            </p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200 shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              O'tish Ko'rsatkichi
            </span>
            <p className="text-2xl font-black text-emerald-700 mt-0.5">
              {groupMetrics.avgPct}% <span className="text-xs font-normal text-slate-400">({groupMetrics.passCount} ta)</span>
            </p>
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────
          3. SEARCH, FILTERS & ACTION BAR
      ──────────────────────────────────────────────────────── */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200 flex flex-col lg:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full lg:w-96">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Talaba ismi bo'yicha qidirish..."
            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-green-600 rounded-2xl pl-11 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
          {/* Grade Filter */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs text-slate-700">
            <Filter size={14} className="text-slate-400" />
            <span>Baho:</span>
            <select
              value={filterScore}
              onChange={(e) => setFilterScore(e.target.value)}
              className="bg-transparent text-slate-800 outline-none cursor-pointer font-bold"
            >
              <option value="all">Barcha baholar</option>
              <option value="a">A'lo (86 - 100%)</option>
              <option value="b">Yaxshi (71 - 85%)</option>
              <option value="c">Qoniqarli (56 - 70%)</option>
              <option value="f">Qoniqarsiz (&lt;56%)</option>
              <option value="violations">Qoidabuzarlar</option>
            </select>
          </div>

          {/* Sorting */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs text-slate-700">
            <span>Saralash:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-slate-900 outline-none cursor-pointer font-semibold"
            >
              <option value="time">Vaqt (Eng yangilar)</option>
              <option value="score">Ball (Yuqoridan)</option>
              <option value="name">Talaba Ismi (A-Z)</option>
              <option value="violations">Qoidabuzarliklar</option>
            </select>
          </div>

          {/* CSV Export */}
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-green-700 hover:bg-green-800 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            title="Ushbu ro'yxatni Excel (CSV) formatida yuklab olish"
          >
            <Download size={14} />
            <span>
              {filterGroup === "all" ? "Barcha Natijalar CSV" : `${filterGroup} CSV Eksport`}
            </span>
          </button>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────
          4. RESULTS TABLE
      ──────────────────────────────────────────────────────── */}
      <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-sm">
        {/* Active group header bar */}
        {filterGroup !== "all" && currentActiveGroup && (
          <div className="px-6 py-3.5 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <h4 className="text-xs font-bold text-emerald-900">
                Guruh: <span className="font-extrabold text-sm">{currentActiveGroup.name}</span> ({currentActiveGroup.code})
              </h4>
            </div>
            <button
              onClick={() => setFilterGroup("all")}
              className="text-xs text-emerald-700 hover:text-emerald-900 font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              <X size={13} /> Filtrni tozalash
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-bold border-b border-slate-200 tracking-wider">
              <tr>
                <th className="px-6 py-4">#</th>
                <th className="px-6 py-4">Talaba Ismi</th>
                <th className="px-6 py-4">Guruh</th>
                <th className="px-6 py-4">To'plagan Ball</th>
                <th className="px-6 py-4">Foiz</th>
                <th className="px-6 py-4">Qoidabuzarlik</th>
                <th className="px-6 py-4">Topshirilgan Vaqt</th>
                <th className="px-6 py-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-slate-400 text-sm space-y-2">
                    <Users size={36} className="mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">Qidiruvga mos natijalar topilmadi</p>
                    <p className="text-xs text-slate-400">
                      Boshqa guruhni tanlang yoki qidiruv so'zini o'zgartirib ko'ring.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((r, idx) => {
                  const score = Number(r.score) || 0;
                  const total = getTotalPoints(r);
                  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
                  const isPass = pct >= 60;
                  const grp = r.group_code || r.answers?._meta?.group_code;

                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-slate-50/90 transition-colors group cursor-pointer"
                      onClick={() => onInspectStudent(r)}
                    >
                      <td className="px-6 py-4 text-xs font-bold text-slate-400">{idx + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-green-50 text-green-800 flex items-center justify-center font-bold text-sm border border-green-200 shrink-0">
                            {r.student_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 group-hover:text-green-700 transition-colors text-sm">
                              {r.student_name}
                            </p>
                            <p className="text-[11px] text-slate-400">Natija ID: #{r.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {grp ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setFilterGroup(grp.toUpperCase());
                            }}
                            className="px-3 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-mono font-bold text-xs border border-emerald-200 transition-all cursor-pointer inline-flex items-center gap-1.5"
                            title={`Faqat ${grp} guruhini filtrlash`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            <span>{grp}</span>
                          </button>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-500 text-xs italic font-medium">
                            Guruhsiz
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-base font-extrabold ${isPass ? "text-emerald-700" : "text-rose-600"}`}>
                          {score}
                        </span>
                        <span className="text-xs text-slate-400"> / {total}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold border ${
                            pct >= 86
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : pct >= 71
                              ? "bg-blue-50 text-blue-800 border-blue-200"
                              : pct >= 56
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : "bg-rose-50 text-rose-800 border-rose-200"
                          }`}
                        >
                          {pct}%
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {r.violation_count > 0 ? (
                          <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center gap-1.5 w-fit">
                            <AlertTriangle size={13} />
                            {r.violation_count} ta
                          </span>
                        ) : (
                          <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                            <CheckCircle size={13} /> 0 ta
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Clock size={13} />
                          {new Date(r.submitted_at || r.created_at).toLocaleString("uz-UZ")}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onInspectStudent(r)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-green-50 text-slate-600 hover:text-green-700 border border-slate-200 transition-colors cursor-pointer"
                            title="Batafsil ko'rish"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => setItemToDelete(r)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 transition-colors cursor-pointer"
                            title="O'chirish"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────
          5. ANIMATED DELETE CONFIRMATION MODAL
      ──────────────────────────────────────────────────────── */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 transform transition-all animate-scale-up space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
                <Trash2 size={24} />
              </div>
              <button
                onClick={() => setItemToDelete(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Natijani o'chirishni xohlaysizmi?
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Ushbu amalni ortga qaytarib bo'lmaydi. Talabaning to'plagan bali va barcha javoblari bazadan butunlay o'chiriladi.
              </p>
            </div>

            {/* Student Preview Box */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-sm">{itemToDelete.student_name}</span>
                <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                  {itemToDelete.score} / {itemToDelete.total_points} ball
                </span>
              </div>
              <div className="text-slate-500 flex items-center gap-2">
                <span>Guruh: <strong>{itemToDelete.group_code || itemToDelete.answers?._meta?.group_code || "Umumiy"}</strong></span>
                <span>•</span>
                <span>{new Date(itemToDelete.submitted_at || itemToDelete.created_at).toLocaleString("uz-UZ")}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="flex-1 py-3 rounded-2xl border border-slate-200 font-bold text-xs text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Bekor Qilish
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
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
