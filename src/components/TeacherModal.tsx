import React, { useState, useEffect } from "react";
import { X, Save, User, Lock, BookOpen, Phone, Shield } from "lucide-react";
import type { AdminUser } from "../types";

type TeacherModalProps = {
  isOpen: boolean;
  teacher: AdminUser | null;
  onClose: () => void;
  onSave: (data: {
    full_name: string;
    username: string;
    password?: string;
    subject?: string;
    phone?: string;
    is_active: boolean;
  }) => Promise<void>;
};

export const TeacherModal: React.FC<TeacherModalProps> = ({
  isOpen,
  teacher,
  onClose,
  onSave,
}) => {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [subject, setSubject] = useState("Frontend");
  const [phone, setPhone] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (teacher) {
      setFullName(teacher.full_name || "");
      setUsername(teacher.username || "");
      setPassword(teacher.password || "");
      setSubject(teacher.subject || "Frontend");
      setPhone(teacher.phone || "");
      setIsActive(teacher.is_active !== false);
    } else {
      setFullName("");
      setUsername("");
      setPassword("");
      setSubject("Frontend");
      setPhone("");
      setIsActive(true);
    }
    setError(null);
  }, [teacher, isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim() || !username.trim()) {
      setError("Ism va Login maydonlari to'ldirilishi shart");
      return;
    }
    if (!teacher && !password.trim()) {
      setError("Yangi ustoz uchun parol kiritilishi shart");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave({
        full_name: fullName.trim(),
        username: username.trim().toLowerCase(),
        password: password.trim() ? password.trim() : undefined,
        subject: subject.trim(),
        phone: phone.trim() || undefined,
        is_active: isActive,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || "Xatolik yuz berdi. Qaytadan urinib ko'ring.");
    } finally {
      setIsSaving(false);
    }
  }

  const subjectPresets = [
    "Frontend (HTML, CSS, JS)",
    "JavaScript",
    "Python",
    "Fullstack",
    "Backend",
    "Dasturlash Asoslari",
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#3a7d5a] border border-emerald-200 flex items-center justify-center shadow-xs">
              <Shield size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                {teacher ? "Ustoz Ma'lumotlarini Tahrirlash" : "Yangi Ustoz (Admin) Yaratish"}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Ustoz tizimga o'z shaxsiy login va paroli bilan kiradi
              </p>
            </div>
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs text-slate-700">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold animate-fade-in">
              {error}
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-800">
              Ustoz F.I.SH (To'liq ismi) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Masalan: Sardor Rahimov"
                required
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#3a7d5a] focus:ring-1 focus:ring-[#3a7d5a] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-900 outline-none transition-all placeholder:text-slate-400"
              />
              <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* Username & Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-800">
                Login (Foydalanuvchi nomi) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, "_"))}
                  placeholder="masalan: ustoz_sardor"
                  required
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#3a7d5a] focus:ring-1 focus:ring-[#3a7d5a] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-900 font-mono outline-none transition-all placeholder:text-slate-400"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold font-mono text-[11px]">@</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-slate-800">
                {teacher ? "Yangi Parol (ixtiyoriy)" : "Parol"} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={teacher ? "O'zgartirish uchun kiriting..." : "Parolni kiriting"}
                  required={!teacher}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#3a7d5a] focus:ring-1 focus:ring-[#3a7d5a] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-900 outline-none transition-all placeholder:text-slate-400 font-mono"
                />
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Subject / Specialty */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-800">
              Mutaxassislik / Fan Yo'nalishi
            </label>
            <div className="relative">
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Masalan: Frontend, Python, JS..."
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#3a7d5a] focus:ring-1 focus:ring-[#3a7d5a] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-900 outline-none transition-all placeholder:text-slate-400"
              />
              <BookOpen size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {subjectPresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setSubject(preset)}
                  className={`text-[10px] px-2 py-1 rounded-lg border transition-colors cursor-pointer ${
                    subject === preset
                      ? "bg-emerald-50 text-[#3a7d5a] border-emerald-300 font-bold"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-800">Telefon Raqami (ixtiyoriy)</label>
            <div className="relative">
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+998 90 123 45 67"
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#3a7d5a] focus:ring-1 focus:ring-[#3a7d5a] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-900 outline-none transition-all placeholder:text-slate-400 font-mono"
              />
              <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* Status Active Toggle */}
          <div className="pt-2">
            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/70 cursor-pointer hover:bg-slate-100/60 transition-colors">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-[#3a7d5a] focus:ring-[#3a7d5a] border-slate-300 cursor-pointer"
              />
              <div>
                <p className="font-bold text-slate-900 text-xs">Hisob faol holatda</p>
                <p className="text-[11px] text-slate-500">
                  Faolsizlantirilsa, ustoz ushbu login bilan portalga kira olmaydi
                </p>
              </div>
            </label>
          </div>

          {/* Footer actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold text-xs transition-colors cursor-pointer"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-[#3a7d5a] hover:bg-[#2e6548] text-white font-bold text-xs shadow-md shadow-[#3a7d5a]/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <Save size={15} />
              <span>{isSaving ? "Saqlanmoqda..." : teacher ? "O'zgarishlarni saqlash" : "Ustozni Yaratish"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
