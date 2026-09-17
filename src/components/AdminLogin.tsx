import React, { useState } from "react";
import { Lock, User, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import { writeStorage } from "../lib/storage";
import { supabase } from "../lib/supabase";
import type { AdminUser } from "../types";

type AdminLoginProps = {
  onSuccess: (user: AdminUser) => void;
};

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;

    setIsLoading(true);
    setError(false);
    setErrorMessage("");

    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    try {
      // 1. Supabase admin_users jadvalidan foydalanuvchini tekshirish
      const { data, error: sbError } = await supabase
        .from("admin_users")
        .select("*")
        .eq("username", cleanUsername)
        .maybeSingle();

      if (data && !sbError) {
        if (!data.is_active) {
          setError(true);
          setErrorMessage("Ushbu hisob faolsizlantirilgan. Iltimos, Super Admin bilan bog'laning.");
          setIsLoading(false);
          return;
        }

        if (data.password === cleanPassword) {
          const user: AdminUser = {
            id: data.id,
            full_name: data.full_name,
            username: data.username,
            role: data.role as "super_admin" | "teacher",
            subject: data.subject || undefined,
            phone: data.phone || undefined,
            is_active: data.is_active !== false,
            created_at: data.created_at,
          };

          // Update last_login in background
          supabase
            .from("admin_users")
            .update({ last_login: new Date().toISOString() })
            .eq("id", data.id)
            .then();

          writeStorage("monday_admin_auth", "true");
          writeStorage("monday_current_admin", JSON.stringify(user));
          onSuccess(user);
          return;
        }
      }

      // 2. Fallback / Zaxira Super Admin tekshiruvi (Jadval hali ochilmagan yoki dastlabki kirish uchun)
      if (
        (cleanUsername.toLowerCase() === "superadmin" && cleanPassword === "JAMSHID") ||
        (cleanUsername === "JAMSHID" && cleanPassword === "JAMSHID")
      ) {
        const fallbackAdmin: AdminUser = {
          id: "master_super_admin",
          full_name: "Bosh Administrator",
          username: "superadmin",
          role: "super_admin",
          is_active: true,
        };
        writeStorage("monday_admin_auth", "true");
        writeStorage("monday_current_admin", JSON.stringify(fallbackAdmin));
        onSuccess(fallbackAdmin);
        return;
      }

      setError(true);
      setErrorMessage("Login yoki parol noto'g'ri! Qaytadan urinib ko'ring.");
    } catch (err) {
      console.warn("Auth error:", err);
      // Fallback
      if (cleanUsername.toLowerCase() === "superadmin" && cleanPassword === "JAMSHID") {
        const fallbackAdmin: AdminUser = {
          id: "master_super_admin",
          full_name: "Bosh Administrator",
          username: "superadmin",
          role: "super_admin",
          is_active: true,
        };
        writeStorage("monday_admin_auth", "true");
        writeStorage("monday_current_admin", JSON.stringify(fallbackAdmin));
        onSuccess(fallbackAdmin);
        return;
      }
      setError(true);
      setErrorMessage("Tizimga kirishda xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 selection:bg-emerald-100 selection:text-emerald-900">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl p-8 space-y-6 animate-scale-up">
        {/* Top Logo & Icon */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#3a7d5a] border border-emerald-200 flex items-center justify-center mx-auto shadow-xs">
            <Lock size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">MONDAY Portal</h1>
            <p className="text-xs text-slate-500 mt-1">
              Boshqaruv tizimiga kirish uchun login va parolingizni kiriting
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              Login (Foydalanuvchi nomi)
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (error) setError(false);
                }}
                placeholder="Masalan: superadmin yoki ustoz_ali"
                autoFocus
                required
                className={`w-full bg-slate-50 border rounded-2xl pl-10 pr-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 ${
                  error
                    ? "border-rose-300 bg-rose-50/30 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    : "border-slate-200 focus:bg-white focus:border-[#3a7d5a] focus:ring-2 focus:ring-[#3a7d5a]/20"
                }`}
              />
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <User size={18} />
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              Parol
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(false);
                }}
                placeholder="Parolni kiriting..."
                required
                className={`w-full bg-slate-50 border rounded-2xl pl-10 pr-11 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 ${
                  error
                    ? "border-rose-300 bg-rose-50/30 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    : "border-slate-200 focus:bg-white focus:border-[#3a7d5a] focus:ring-2 focus:ring-[#3a7d5a]/20"
                }`}
              />
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock size={18} />
              </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer p-1"
                title={showPassword ? "Parolni yashirish" : "Parolni ko'rsatish"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error && (
              <p className="text-xs text-rose-600 font-semibold flex items-center gap-1.5 pt-1 animate-fade-in">
                <AlertCircle size={14} className="shrink-0" />
                <span>{errorMessage}</span>
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl bg-[#3a7d5a] hover:bg-[#2e6548] text-white font-bold text-sm shadow-md shadow-[#3a7d5a]/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Tekshirilmoqda...</span>
              </>
            ) : (
              <>
                <span>Tizimga Kirish</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Security badge footer */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck size={14} className="text-[#3a7d5a]" />
          <span>Super Admin & Ustozlar Himoyalangan Tizimi</span>
        </div>
      </div>
    </div>
  );
};

