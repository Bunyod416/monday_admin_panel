import React, { useState, useMemo } from "react";
import {
  Settings,
  Clock,
  Save,
  ShieldAlert,
  Shuffle,
  Maximize,
  CheckCircle2,
  RotateCcw,
  Sliders,
  Check,
  ShieldCheck,
  BookOpen,
  Lock,
  Layers,
} from "lucide-react";
import type { Category, ExamSettings, Question } from "../types";

type ExamConfigViewProps = {
  settings: ExamSettings;
  questions?: Question[];
  onSaveSettings: (settings: ExamSettings) => Promise<void> | void;
};

type SecurityPreset = "relaxed" | "standard" | "strict" | "custom";

export const ExamConfigView: React.FC<ExamConfigViewProps> = ({
  settings,
  questions = [],
  onSaveSettings,
}) => {
  const [counts, setCounts] = useState<Record<Category, number>>(settings.counts);
  const [duration, setDuration] = useState<number>(settings.durationMinutes || 60);
  const [maxViolations, setMaxViolations] = useState<number>(settings.maxViolations ?? 3);
  const [penalty, setPenalty] = useState<number>(settings.penaltyPerViolation ?? 1);
  const [enforceFullscreen, setEnforceFullscreen] = useState<boolean>(settings.enforceFullscreen !== false);
  const [shuffleQuestions, setShuffleQuestions] = useState<boolean>(settings.shuffleQuestions !== false);
  const [shuffleOptions, setShuffleOptions] = useState<boolean>(settings.shuffleOptions !== false);

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activePreset, setActivePreset] = useState<SecurityPreset>("standard");

  const categories: Category[] = ["HTML", "CSS", "JavaScript", "Python"];

  function getPoolCount(cat: Category): number {
    return questions.filter((q) => q.category === cat).length;
  }

  const totalQuestions = categories.reduce((sum, cat) => sum + (counts[cat] || 0), 0);

  // Dynamic Security Score calculation (0 - 100%)
  const securityScore = useMemo(() => {
    let score = 0;
    if (enforceFullscreen) score += 35;
    if (shuffleQuestions) score += 20;
    if (shuffleOptions) score += 20;
    if (maxViolations <= 3) score += 15;
    else if (maxViolations <= 5) score += 8;
    if (penalty >= 1) score += 10;
    return Math.min(100, score);
  }, [enforceFullscreen, shuffleQuestions, shuffleOptions, maxViolations, penalty]);

  // Apply Security Presets
  function applySecurityPreset(preset: SecurityPreset) {
    setActivePreset(preset);
    if (preset === "relaxed") {
      setMaxViolations(10);
      setPenalty(0);
      setEnforceFullscreen(false);
      setShuffleQuestions(false);
      setShuffleOptions(false);
    } else if (preset === "standard") {
      setMaxViolations(3);
      setPenalty(1);
      setEnforceFullscreen(true);
      setShuffleQuestions(true);
      setShuffleOptions(true);
    } else if (preset === "strict") {
      setMaxViolations(2);
      setPenalty(2);
      setEnforceFullscreen(true);
      setShuffleQuestions(true);
      setShuffleOptions(true);
    }
  }

  // Category Presets
  function applyCategoryPreset(perCategory: number | "max") {
    const newCounts = {} as Record<Category, number>;
    for (const cat of categories) {
      const pool = getPoolCount(cat);
      if (perCategory === "max") {
        newCounts[cat] = pool > 0 ? pool : 30;
      } else {
        newCounts[cat] = pool > 0 ? Math.min(pool, perCategory) : perCategory;
      }
    }
    setCounts(newCounts);
  }

  // Reset to default
  function handleResetDefaults() {
    setCounts({ HTML: 30, CSS: 30, JavaScript: 30, Python: 30 });
    setDuration(60);
    applySecurityPreset("standard");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSaveSettings({
        counts,
        durationMinutes: Math.max(5, Math.min(300, Number(duration))),
        maxViolations: Math.max(1, Math.min(20, Number(maxViolations))),
        penaltyPerViolation: Math.max(0, Math.min(10, Number(penalty))),
        enforceFullscreen,
        shuffleQuestions,
        shuffleOptions,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-16">
      {/* ────────────────────────────────────────────────────────
          1. HEADER BAR
      ──────────────────────────────────────────────────────── */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-700 flex items-center justify-center border border-green-200 shrink-0">
            <Settings size={24} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Standart Imtihon Sozlamalari</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Anticheat xavfsizligi, savollar soni va asosiy imtihon qoidalari
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleResetDefaults}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors border border-slate-200 cursor-pointer self-start sm:self-auto"
          title="Barcha sozlamalarni standart holatga qaytarish"
        >
          <RotateCcw size={14} />
          <span>Tiklash</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* ────────────────────────────────────────────────────────
            2. XAVFSIZLIK VA ANTICHEAT REJIMI
        ──────────────────────────────────────────────────────── */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200 shrink-0">
                <ShieldAlert size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Anticheat & Xavfsizlik Nazorati</h3>
                <p className="text-xs text-slate-500">Talaba ekrandan chiqishi va aralashtirish qoidalari</p>
              </div>
            </div>

            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              Himoya: {securityScore}%
            </span>
          </div>

          {/* Quick Presets */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => applySecurityPreset("relaxed")}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                activePreset === "relaxed"
                  ? "bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20"
                  : "bg-slate-50/70 hover:bg-slate-100/70 border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <BookOpen size={15} className="text-emerald-700" />
                  Yengil / Sinov
                </span>
                {activePreset === "relaxed" && <Check size={16} className="text-emerald-700" />}
              </div>
              <p className="text-xs text-slate-500">10 ogohlantirish, 0 jarima, erkin ekran</p>
            </button>

            <button
              type="button"
              onClick={() => applySecurityPreset("standard")}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                activePreset === "standard"
                  ? "bg-green-50/80 border-green-600 ring-2 ring-green-600/20"
                  : "bg-slate-50/70 hover:bg-slate-100/70 border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck size={15} className="text-green-700" />
                  Standart Imtihon
                </span>
                {activePreset === "standard" && <Check size={16} className="text-green-700" />}
              </div>
              <p className="text-xs text-slate-500">3 ogohlantirish, -1 jarima, to'liq ekran</p>
            </button>

            <button
              type="button"
              onClick={() => applySecurityPreset("strict")}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                activePreset === "strict"
                  ? "bg-teal-50/80 border-teal-600 ring-2 ring-teal-600/20"
                  : "bg-slate-50/70 hover:bg-slate-100/70 border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <Lock size={15} className="text-teal-700" />
                  Qat'iy / Proctor
                </span>
                {activePreset === "strict" && <Check size={16} className="text-teal-700" />}
              </div>
              <p className="text-xs text-slate-500">2 ogohlantirishda chetlatish, -2 jarima</p>
            </button>
          </div>

          {/* Steppers & Limits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Bloklash Chegarasi
                </label>
                <span className="text-xs font-extrabold text-slate-900 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200">
                  {maxViolations} ta
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 5, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      setMaxViolations(num);
                      setActivePreset("custom");
                    }}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      maxViolations === num
                        ? "bg-green-700 text-white border-green-700 shadow-xs"
                        : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    {num} ta
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Jarima Bali (Har bir chiqishda)
                </label>
                <span className="text-xs font-extrabold text-slate-900 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200">
                  {penalty > 0 ? `-${penalty} ball` : "0 ball"}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {[0, 1, 2, 3, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      setPenalty(num);
                      setActivePreset("custom");
                    }}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      penalty === num
                        ? "bg-green-700 text-white border-green-700 shadow-xs"
                        : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    {num === 0 ? "0" : `-${num}`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3 Switches */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div
              onClick={() => {
                setEnforceFullscreen(!enforceFullscreen);
                setActivePreset("custom");
              }}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                enforceFullscreen ? "bg-emerald-50/80 border-emerald-300" : "bg-slate-50 border-slate-200"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Maximize size={16} className={enforceFullscreen ? "text-emerald-700" : "text-slate-400"} />
                <span className="text-xs font-bold text-slate-800">To'liq ekran majburiy</span>
              </div>
              <div
                className={`w-9 h-5 rounded-full transition-colors flex items-center p-0.5 shrink-0 ${
                  enforceFullscreen ? "bg-green-700 justify-end" : "bg-slate-300 justify-start"
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
              </div>
            </div>

            <div
              onClick={() => {
                setShuffleQuestions(!shuffleQuestions);
                setActivePreset("custom");
              }}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                shuffleQuestions ? "bg-emerald-50/80 border-emerald-300" : "bg-slate-50 border-slate-200"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Shuffle size={16} className={shuffleQuestions ? "text-emerald-700" : "text-slate-400"} />
                <span className="text-xs font-bold text-slate-800">Savollarni aralashtirish</span>
              </div>
              <div
                className={`w-9 h-5 rounded-full transition-colors flex items-center p-0.5 shrink-0 ${
                  shuffleQuestions ? "bg-green-700 justify-end" : "bg-slate-300 justify-start"
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
              </div>
            </div>

            <div
              onClick={() => {
                setShuffleOptions(!shuffleOptions);
                setActivePreset("custom");
              }}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                shuffleOptions ? "bg-emerald-50/80 border-emerald-300" : "bg-slate-50 border-slate-200"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sliders size={16} className={shuffleOptions ? "text-emerald-700" : "text-slate-400"} />
                <span className="text-xs font-bold text-slate-800">Variantlarni aralashtirish</span>
              </div>
              <div
                className={`w-9 h-5 rounded-full transition-colors flex items-center p-0.5 shrink-0 ${
                  shuffleOptions ? "bg-green-700 justify-end" : "bg-slate-300 justify-start"
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
              </div>
            </div>
          </div>
        </div>

        {/* ────────────────────────────────────────────────────────
            3. SAVOLLAR TAQSIMOTI VA VAQT
        ──────────────────────────────────────────────────────── */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 text-green-700 flex items-center justify-center border border-green-200 shrink-0">
                <BookOpen size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Standart Savollar Taqsimoti</h3>
                <p className="text-xs text-slate-500">Yangi guruhlar va umumiy imtihon uchun boshlang'ich hajm</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {[30, 20, 15].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => applyCategoryPreset(preset)}
                  className="px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-green-50 hover:text-green-800 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
                >
                  {preset} tadan
                </button>
              ))}
            </div>
          </div>

          {/* 4 Category Inputs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {categories.map((cat) => {
              const pool = getPoolCount(cat);
              return (
                <div
                  key={cat}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-xs">{cat}</span>
                    <span className="text-[10px] text-slate-400 font-medium">Bazada: {pool || 30}</span>
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={counts[cat] || 0}
                    onChange={(e) => setCounts({ ...counts, [cat]: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-200 focus:border-green-600 rounded-xl px-3 py-1.5 text-center font-black text-slate-900 text-sm outline-none transition-colors"
                  />
                </div>
              );
            })}
          </div>

          {/* Total Questions Pill */}
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
            <span className="text-emerald-800 font-semibold flex items-center gap-1.5">
              <Layers size={14} className="text-emerald-600" />
              Jami standart savollar miqdori:
            </span>
            <span className="font-black text-emerald-950 text-sm">
              {totalQuestions} ta savol ({totalQuestions} ball)
            </span>
          </div>

          {/* Duration */}
          <div className="pt-2 border-t border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                <Clock size={14} className="text-green-700" />
                Standart Imtihon Davomiyligi
              </label>
              <span className="font-extrabold text-green-800 bg-green-50 px-2.5 py-0.5 rounded-lg border border-green-200 text-xs">
                {duration} daqiqa
              </span>
            </div>

            <div className="flex items-center gap-2">
              {[30, 45, 60, 90, 120, 180].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDuration(mins)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    duration === mins
                      ? "bg-green-700 text-white border-green-700 shadow-xs"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ────────────────────────────────────────────────────────
            4. SAVE BUTTON & SUCCESS
        ──────────────────────────────────────────────────────── */}
        {savedSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center justify-center gap-2 animate-fade-in shadow-xs">
            <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
            <span>Standart imtihon sozlamalari muvaffaqiyatli saqlandi!</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-4 rounded-2xl bg-green-700 hover:bg-green-800 text-white font-black text-sm shadow-md shadow-green-700/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Saqlanmoqda...</span>
            </>
          ) : (
            <>
              <Save size={16} />
              <span>Sozlamalarni Saqlash</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
