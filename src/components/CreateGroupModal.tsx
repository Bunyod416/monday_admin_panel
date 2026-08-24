import React, { useState } from "react";
import { X, Save, Sparkles, Clock, Users } from "lucide-react";
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
  if (!isOpen) return null;

  const [groupName, setGroupName] = useState("");
  const [groupCode, setGroupCode] = useState(() => "GRP-" + Math.floor(1000 + Math.random() * 9000));
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
  const totalQuestions = categories.reduce((sum, cat) => sum + (counts[cat] || 0), 0);

  function generateRandomCode() {
    const prefixes = ["FE", "JS", "WEB", "GRP", "IT"];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = Math.floor(100 + Math.random() * 900);
    setGroupCode(`${prefix}-${num}`);
  }

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

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Yangi Guruh Yaratish</h2>
            <p className="text-xs text-slate-500 mt-0.5">Imtihon sessiyasi va talabalar limiti sozlamalari</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-sm text-slate-700">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Guruh Nomi</label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Masalan: Frontend 101, Kechki guruh..."
              required
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-green-600 rounded-xl px-3.5 py-2.5 text-slate-900 outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 items-center justify-between">
                <span>Guruh Kodi</span>
                <button
                  type="button"
                  onClick={generateRandomCode}
                  className="text-[11px] text-green-700 hover:text-green-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles size={12} /> Yangi kod
                </button>
              </label>
              <input
                type="text"
                value={groupCode}
                onChange={(e) => setGroupCode(e.target.value.toUpperCase())}
                placeholder="FE-101"
                required
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-green-600 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono font-bold uppercase outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 items-center gap-1.5">
                <Users size={14} className="text-green-700" />
                <span>Talabalar Soni Limiti (1 - 30)</span>
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={maxStudents}
                onChange={(e) => setMaxStudents(Math.max(1, Math.min(30, Number(e.target.value))))}
                required
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-green-600 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold text-center outline-none transition-colors"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Clock size={15} className="text-green-700" />
                Imtihon Davomiyligi (daqiqa)
              </label>
              <input
                type="number"
                min={5}
                max={300}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-24 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-center text-sm font-bold text-slate-900 outline-none focus:border-green-600"
              />
            </div>
          </div>

          {/* Category Counts Breakdown */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Savollar Soni (Har bir bo'limdan)
            </label>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((cat) => (
                <div key={cat} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">{cat}</span>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={counts[cat] || 0}
                    onChange={(e) => setCounts({ ...counts, [cat]: Number(e.target.value) })}
                    className="w-16 bg-white border border-slate-200 rounded-lg px-2 py-1 text-center text-sm font-bold text-slate-900 outline-none focus:border-green-600"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-green-50 border border-green-200 flex items-center justify-between text-xs">
            <span className="text-green-800 font-semibold">Jami savollar:</span>
            <span className="text-green-900 font-extrabold text-sm">{totalQuestions} ta savol ({totalQuestions} ball)</span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 font-semibold transition-colors cursor-pointer"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-green-700 hover:bg-green-800 text-white font-bold transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <Save size={16} />
              <span>{isSaving ? "Yaratilmoqda..." : "Guruhni Yaratish"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
