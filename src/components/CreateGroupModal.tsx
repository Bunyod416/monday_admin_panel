import React, { useState, useEffect } from "react";
import { X, Save, RefreshCw, Users, Clock, BookOpen, Layers } from "lucide-react";
import type { Category, ExamGroup } from "../types";

type CreateGroupModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (group: ExamGroup) => Promise<void>;
};

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [groupName, setGroupName] = useState("");
  const [groupCode, setGroupCode] = useState(() => "FE-" + Math.floor(100 + Math.random() * 900));
  const [maxStudents, setMaxStudents] = useState<number>(30);
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [counts, setCounts] = useState<Record<Category, number>>({
    HTML: 30,
    CSS: 30,
    JavaScript: 30,
    Python: 30,
  });
  const [isSaving, setIsSaving] = useState(false);

  const categories: Category[] = ["HTML", "CSS", "JavaScript", "Python"];
  const totalQuestions = categories.reduce((sum, cat) => sum + (Number(counts[cat]) || 0), 0);

  function generateRandomCode() {
    const prefixes = ["FE", "JS", "WEB", "IT", "DEV"];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = Math.floor(100 + Math.random() * 900);
    setGroupCode(`${prefix}-${num}`);
  }

  function applyPreset(perCategory: number) {
    setCounts({
      HTML: perCategory,
      CSS: perCategory,
      JavaScript: perCategory,
      Python: perCategory,
    });
  }

  useEffect(() => {
    if (isOpen) {
      setGroupName("");
      setMaxStudents(30);
      setDurationMinutes(60);
      setCounts({ HTML: 30, CSS: 30, JavaScript: 30, Python: 30 });
      generateRandomCode();
    }
  }, [isOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!groupName.trim() || !groupCode.trim()) return;

    setIsSaving(true);
    try {
      const newGroup: ExamGroup = {
        group_name: groupName.trim(),
        group_code: groupCode.trim().toUpperCase(),
        max_students: Math.max(1, Math.min(30, Number(maxStudents) || 30)),
        duration_minutes: Math.max(5, Math.min(300, Number(durationMinutes) || 60)),
        counts,
        is_active: true,
      };

      await onSave(newGroup);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Guruhni saqlashda xatolik yuz berdi");
    } finally {
      setIsSaving(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Yangi Guruh Yaratish</h2>
            <p className="text-xs text-slate-500 mt-0.5">Imtihon sessiyasi va talabalar limiti sozlamalari</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-xs text-slate-700">
          {/* Group Name */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-800">Guruh Nomi</label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Masalan: Frontend 101, Kechki guruh..."
              required
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-green-600 focus:ring-1 focus:ring-green-600 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Group Code & Students Limit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-800">Guruh Kodi</label>
                <button
                  type="button"
                  onClick={generateRandomCode}
                  className="text-[11px] text-green-700 hover:text-green-800 font-medium flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RefreshCw size={11} />
                  <span>Yangi kod</span>
                </button>
              </div>
              <input
                type="text"
                value={groupCode}
                onChange={(e) => setGroupCode(e.target.value.toUpperCase())}
                placeholder="FE-145"
                required
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-green-600 focus:ring-1 focus:ring-green-600 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono font-bold uppercase outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-800 flex items-center gap-1">
                  <Users size={12} className="text-green-700" />
                  <span>Talabalar Limiti</span>
                </label>
                <span className="text-[11px] text-slate-400">maks. 30</span>
              </div>
              <div className="flex items-center gap-1.5">
                {[15, 20, 25, 30].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setMaxStudents(num)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      maxStudents === num
                        ? "bg-green-700 text-white border-green-700 shadow-xs"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Exam Duration */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Clock size={13} className="text-green-700" />
                <span>Imtihon Davomiyligi (daqiqa)</span>
              </label>
              <span className="font-bold text-green-800 bg-green-50 px-2.5 py-1 rounded-lg border border-green-200 text-xs">
                {durationMinutes} daqiqa
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {[30, 45, 60, 90, 120].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDurationMinutes(mins)}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
                    durationMinutes === mins
                      ? "bg-green-700 text-white border-green-700 shadow-xs"
                      : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>

          {/* Category Questions Breakdown */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-800 flex items-center gap-1.5">
                <BookOpen size={13} className="text-green-700" />
                <span>Savollar Soni (Har bir bo'limdan)</span>
              </label>
              <div className="flex items-center gap-1">
                {[30, 20, 15].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-green-50 hover:text-green-800 text-slate-700 text-[10px] font-medium border border-slate-200 transition-colors cursor-pointer"
                  >
                    {preset} tadan
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {categories.map((cat) => (
                <div
                  key={cat}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                >
                  <span className="font-medium text-slate-700 text-xs">{cat}</span>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={counts[cat] || 0}
                    onChange={(e) => setCounts({ ...counts, [cat]: Number(e.target.value) })}
                    className="w-14 bg-white border border-slate-200 focus:border-green-600 rounded-lg px-2 py-1 text-center font-bold text-slate-900 text-xs outline-none transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Total Summary */}
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
            <span className="text-emerald-800 font-medium flex items-center gap-1.5">
              <Layers size={13} className="text-emerald-600" />
              <span>Jami savollar va umumiy ball:</span>
            </span>
            <span className="font-bold text-emerald-950">
              {totalQuestions} ta savol ({totalQuestions} ball)
            </span>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs transition-colors cursor-pointer"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-700 hover:bg-green-800 text-white font-semibold text-xs transition-all shadow-sm shadow-green-700/20 disabled:opacity-50 cursor-pointer"
            >
              <Save size={14} />
              <span>{isSaving ? "Saqlanmoqda..." : "Guruhni Yaratish"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
