import React, { useState } from "react";
import {
  Settings,
  Clock,
  Save,
  ShieldAlert,
  Shuffle,
  Maximize,
  CheckCircle2,
} from "lucide-react";
import type { Category, ExamSettings, Question } from "../types";

type ExamConfigViewProps = {
  settings: ExamSettings;
  questions?: Question[];
  onSaveSettings: (settings: ExamSettings) => Promise<void> | void;
};

export const ExamConfigView: React.FC<ExamConfigViewProps> = ({
  settings,
  questions = [],
  onSaveSettings,
}) => {
  const [counts, setCounts] = useState<Record<Category, number>>(settings.counts);
  const [duration, setDuration] = useState<number>(settings.durationMinutes || 60);
  const [maxViolations, setMaxViolations] = useState<number>(settings.maxViolations ?? 3);
  const [penalty, setPenalty] = useState<number>(settings.penaltyPerViolation ?? 1);
  const [enforceFullscreen, setEnforceFullscreen] = useState<boolean>(settings.enforceFullscreen ?? true);
  const [shuffleQuestions, setShuffleQuestions] = useState<boolean>(settings.shuffleQuestions ?? true);
  const [shuffleOptions, setShuffleOptions] = useState<boolean>(settings.shuffleOptions ?? true);

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const categories: Category[] = ["HTML", "CSS", "JavaScript", "Python"];

  function getPoolCount(cat: Category): number {
    return questions.filter((q) => q.category === cat).length;
  }

  const totalQuestions = categories.reduce((sum, cat) => sum + (counts[cat] || 0), 0);

  function applyPreset(perCategory: number | "max") {
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

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSaveSettings({
        counts,
        durationMinutes: Math.max(5, Math.min(300, Number(duration))),
        maxViolations: Math.max(1, Math.min(10, Number(maxViolations))),
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
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-700 flex items-center justify-center border border-green-200 shrink-0">
            <Settings size={26} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Umumiy Imtihon Sozlamalari</h3>
            <p className="text-xs text-slate-500">
              Guruhsiz to'g'ridan-to'g'ri topshiruvchi talabalar uchun asosiy imtihon parametrlari
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Bazada jami {questions.length} ta savol</span>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Savollar soni va taqsimoti */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Savollar Taqsimoti (Har bir bo'limdan)</h4>
              <p className="text-xs text-slate-500">Talabaga beriladigan savollar miqdori</p>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Tezkor:</span>
              <button
                type="button"
                onClick={() => applyPreset("max")}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-green-50 hover:text-green-800 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
              >
                Maksimal
              </button>
              <button
                type="button"
                onClick={() => applyPreset(30)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-green-50 hover:text-green-800 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
              >
                30 tadan (120 ta)
              </button>
              <button
                type="button"
                onClick={() => applyPreset(20)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-green-50 hover:text-green-800 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
              >
                20 tadan (80 ta)
              </button>
              <button
                type="button"
                onClick={() => applyPreset(15)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-green-50 hover:text-green-800 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
              >
                15 tadan (60 ta)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat) => {
              const pool = getPoolCount(cat);
              const val = counts[cat] || 0;
              return (
                <div key={cat} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800">{cat}</span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Bazada: {pool > 0 ? `${pool} ta` : "30 ta"}
                    </span>
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={pool > 0 ? pool : 100}
                    value={val}
                    onChange={(e) => setCounts({ ...counts, [cat]: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-center text-xl font-bold text-slate-900 outline-none focus:border-green-600 shadow-sm"
                  />
                </div>
              );
            })}
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
            <span className="text-emerald-900 font-bold">Jami beriladigan savollar va umumiy ball:</span>
            <span className="text-emerald-900 font-black text-base">{totalQuestions} ta savol ({totalQuestions} ball)</span>
          </div>
        </div>

        {/* 2. Vaqt va Davomiylik */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Clock size={16} className="text-green-700" />
                Imtihon Davomiyligi
              </h4>
              <p className="text-xs text-slate-500">Talaba testni yechishi uchun beriladigan vaqt</p>
            </div>
            <div className="flex items-center gap-2">
              {[30, 45, 60, 90, 120].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDuration(mins)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                    duration === mins
                      ? "bg-green-700 text-white border-green-700"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                  }`}
                >
                  {mins} daqiqa
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <input
              type="range"
              min={10}
              max={180}
              step={5}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="flex-1 accent-green-700 cursor-pointer"
            />
            <div className="w-28 p-2 rounded-xl bg-slate-50 border border-slate-200 text-center font-bold text-sm text-slate-900">
              {duration} daqiqa
            </div>
          </div>
        </div>

        {/* 3. Xavfsizlik va Qoidabuzarlik Sozlamalari */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ShieldAlert size={16} className="text-rose-600" />
              Imtihon Xavfsizligi va Nazorat Qoidalari
            </h4>
            <p className="text-xs text-slate-500">Anticheat va qoidabuzarlik cheklovlari</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                Qoidabuzarliklar Limiti (Bloklash chegarasi)
              </label>
              <p className="text-[11px] text-slate-500">
                Nechta ogohlantirishdan keyin talaba butunlay bloklanadi
              </p>
              <input
                type="number"
                min={1}
                max={10}
                value={maxViolations}
                onChange={(e) => setMaxViolations(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-center text-base font-bold text-slate-900 outline-none focus:border-green-600"
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                Har bir qoidabuzarlik uchun jarima (ball)
              </label>
              <p className="text-[11px] text-slate-500">
                Ekrandan chiqqan har bir holat uchun natijadan ayiriladigan ball
              </p>
              <input
                type="number"
                min={0}
                max={5}
                value={penalty}
                onChange={(e) => setPenalty(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-center text-base font-bold text-slate-900 outline-none focus:border-green-600"
              />
            </div>
          </div>

            {/* Toggle Switches */}
            <div className="space-y-3 pt-2">
              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
                <div className="flex items-center gap-3">
                  <Maximize size={18} className="text-green-700" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">To'liq ekran majburiy</p>
                    <p className="text-[11px] text-slate-500">Talaba to'liq ekranda ishlashi shart</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={enforceFullscreen}
                  onChange={(e) => setEnforceFullscreen(e.target.checked)}
                  className="w-5 h-5 accent-green-700 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
                <div className="flex items-center gap-3">
                  <Shuffle size={18} className="text-purple-700" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Savollarni aralashtirish</p>
                    <p className="text-[11px] text-slate-500">Savollar tasodifiy tartibda chiqadi</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={shuffleQuestions}
                  onChange={(e) => setShuffleQuestions(e.target.checked)}
                  className="w-5 h-5 accent-green-700 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
                <div className="flex items-center gap-3">
                  <Shuffle size={18} className="text-blue-700" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Variantlarni aralashtirish</p>
                    <p className="text-[11px] text-slate-500">Variantlar (A, B, C, D) aralashtiriladi</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={shuffleOptions}
                  onChange={(e) => setShuffleOptions(e.target.checked)}
                  className="w-5 h-5 accent-green-700 rounded cursor-pointer"
                />
              </label>
            </div>
        </div>

        {/* Success Alert */}
        {savedSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2 animate-fade-in shadow-sm">
            <CheckCircle2 size={18} className="text-emerald-700" />
            <span>Imtihon sozlamalari muvaffaqiyatli saqlandi va faollashtirildi!</span>
          </div>
        )}

        {/* Save Button */}
        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-4 rounded-2xl bg-green-700 hover:bg-green-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Save size={18} />
          <span>{isSaving ? "Saqlanmoqda..." : "Sozlamalarni Saqlash va Qo'llash"}</span>
        </button>
      </form>
    </div>
  );
};
