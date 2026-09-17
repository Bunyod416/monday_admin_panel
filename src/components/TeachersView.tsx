import React, { useState } from "react";
import {
  UserPlus,
  Search,
  Check,
  Copy,
  Edit2,
  Trash2,
  Shield,
  ShieldCheck,
  Phone,
  BookOpen,
  UserCheck,
  UserX,
  AlertTriangle,
} from "lucide-react";
import type { AdminUser } from "../types";

type TeachersViewProps = {
  teachers: AdminUser[];
  onAddTeacher: () => void;
  onEditTeacher: (teacher: AdminUser) => void;
  onToggleStatus: (id: string, currentStatus: boolean) => Promise<void>;
  onDeleteTeacher: (id: string) => Promise<void>;
};

export const TeachersView: React.FC<TeachersViewProps> = ({
  teachers,
  onAddTeacher,
  onEditTeacher,
  onToggleStatus,
  onDeleteTeacher,
}) => {
  const [search, setSearch] = useState("");
  const [copiedUsername, setCopiedUsername] = useState<string | null>(null);
  const [teacherToDelete, setTeacherToDelete] = useState<AdminUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  function copyUsername(username: string, e: React.MouseEvent) {
    e.stopPropagation();
    navigator.clipboard.writeText(username);
    setCopiedUsername(username);
    setTimeout(() => {
      setCopiedUsername((cur) => (cur === username ? null : cur));
    }, 2000);
  }

  // Filter list
  const filtered = teachers.filter((t) => {
    const q = search.toLowerCase();
    return (
      t.full_name.toLowerCase().includes(q) ||
      t.username.toLowerCase().includes(q) ||
      (t.subject && t.subject.toLowerCase().includes(q))
    );
  });

  const totalTeachers = teachers.length;
  const activeTeachers = teachers.filter((t) => t.is_active !== false).length;
  const inactiveTeachers = totalTeachers - activeTeachers;

  async function confirmDelete() {
    if (!teacherToDelete) return;
    setIsDeleting(true);
    try {
      await onDeleteTeacher(teacherToDelete.id);
      setTeacherToDelete(null);
    } catch (err) {
      console.error("Error deleting teacher:", err);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* ─── Top Stats Summary ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#3a7d5a] border border-emerald-200 flex items-center justify-center">
              <ShieldCheck size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Jami Ustozlar</p>
              <p className="text-2xl font-black text-slate-900 mt-0.5">{totalTeachers}</p>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
              <UserCheck size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Faol Hisoblar</p>
              <p className="text-2xl font-black text-emerald-700 mt-0.5">{activeTeachers}</p>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center">
              <UserX size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Nofaol / Bloklangan</p>
              <p className="text-2xl font-black text-rose-600 mt-0.5">{inactiveTeachers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Action Bar (Search & Add) ─── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ustoz ismi, logini yoki fani bo'yicha qidirish..."
            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#3a7d5a] focus:ring-1 focus:ring-[#3a7d5a] rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 outline-none transition-all placeholder:text-slate-400"
          />
        </div>

        <button
          type="button"
          onClick={onAddTeacher}
          className="px-4 py-2.5 rounded-xl bg-[#3a7d5a] hover:bg-[#2e6548] text-white font-bold text-xs shadow-md shadow-[#3a7d5a]/20 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <UserPlus size={16} />
          <span>Yangi Ustoz Yaratish</span>
        </button>
      </div>

      {/* ─── Teachers Table / Grid ─── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Ro'yxatdan o'tgan Ustozlar</h3>
            <p className="text-xs text-slate-500 mt-0.5">Ustozlar portalga o'z logini va paroli bilan kirishadi</p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
            {filtered.length} ta ustoz
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Shield size={26} />
            </div>
            <h4 className="text-sm font-bold text-slate-800">Ustozlar topilmadi</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {search ? "Qidiruv bo'yicha ustoz topilmadi." : "Hozircha tizimda ustozlar qo'shilmagan. Yuqoridagi tugma orqali yangi ustoz qo'shing."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Ustoz (F.I.SH)</th>
                  <th className="px-6 py-3.5">Login</th>
                  <th className="px-6 py-3.5">Fan / Mutaxassislik</th>
                  <th className="px-6 py-3.5">Telefon</th>
                  <th className="px-6 py-3.5 text-center">Holat</th>
                  <th className="px-6 py-3.5 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((t) => {
                  const isCopied = copiedUsername === t.username;
                  const active = t.is_active !== false;

                  return (
                    <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Name + Avatar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#3a7d5a] border border-emerald-200 flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                            {t.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 text-sm">{t.full_name}</p>
                            <span className="text-[11px] text-slate-400">Ustoz (Admin)</span>
                          </div>
                        </div>
                      </td>

                      {/* Username with Copy */}
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={(e) => copyUsername(t.username, e)}
                          className={`font-mono font-bold text-xs px-2.5 py-1 rounded-lg border transition-all inline-flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                            isCopied
                              ? "bg-[#3a7d5a] text-white border-[#3a7d5a] shadow-xs"
                              : "bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100"
                          }`}
                          title="Loginni nusxalash"
                        >
                          {isCopied ? (
                            <>
                              <Check size={12} className="text-white" />
                              <span>Nusxalandi!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={11} className="text-slate-400" />
                              <span>@{t.username}</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Subject */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold text-[11px]">
                          <BookOpen size={12} />
                          <span>{t.subject || "Umumiy IT"}</span>
                        </span>
                      </td>

                      {/* Phone */}
                      <td className="px-6 py-4 font-mono text-slate-600">
                        {t.phone ? (
                          <span className="inline-flex items-center gap-1">
                            <Phone size={11} className="text-slate-400" />
                            <span>{t.phone}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">—</span>
                        )}
                      </td>

                      {/* Status Active Toggle */}
                      <td className="px-6 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => onToggleStatus(t.id, active)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors cursor-pointer ${
                            active
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                              : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                          }`}
                          title={active ? "Nofaol qilish uchun bosing" : "Faollashtirish uchun bosing"}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-emerald-600" : "bg-rose-600"}`} />
                          <span>{active ? "Faol" : "Nofaol"}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onEditTeacher(t)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Tahrirlash / Parolni o'zgartirish"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setTeacherToDelete(t)}
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Ustozni o'chirish"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Delete Confirmation Modal ─── */}
      {teacherToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl animate-scale-up">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Ustozni o'chirishni tasdiqlaysizmi?</h3>
              <p className="text-xs text-slate-500">
                <span className="font-bold text-slate-800">{teacherToDelete.full_name}</span> (@{teacherToDelete.username}) hisobi butunlay o'chiriladi.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTeacherToDelete(null)}
                className="py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all cursor-pointer disabled:opacity-60"
              >
                {isDeleting ? "O'chirilmoqda..." : "Ha, o'chirish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
