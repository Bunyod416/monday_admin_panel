import React, { useState } from "react";
import { Lock, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import { writeStorage } from "../lib/storage";

type AdminLoginProps = {
  onSuccess: () => void;
};

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess }) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.trim() === "JAMSHID") {
      writeStorage("monday_admin_auth", "true");
      setError(false);
      onSuccess();
    } else {
      setError(true);
      setErrorMessage("Parol noto'g'ri! Qaytadan urinib ko'ring.");
    }
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 selection:bg-emerald-100 selection:text-emerald-900">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl p-8 space-y-6 animate-scale-up">
        {/* Top Logo & Icon */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-green-50 text-green-700 border border-green-200 flex items-center justify-center mx-auto shadow-xs">
            <Lock size={30} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">MONDAY Admin</h1>
            <p className="text-xs text-slate-500 mt-1">
              Boshqaruv paneliga kirish uchun xavfsizlik parolini kiriting
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              Admin Paroli
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
                autoFocus
                required
                className={`w-full bg-slate-50 border rounded-2xl pl-4 pr-11 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 ${error
                  ? "border-rose-300 bg-rose-50/30 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                  : "border-slate-200 focus:bg-white focus:border-green-600 focus:ring-2 focus:ring-green-600/20"
                  }`}
              />
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
                <AlertCircle size={14} />
                <span>{errorMessage}</span>
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-green-700 hover:bg-green-800 text-white font-bold text-sm shadow-md shadow-green-700/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Tizimga Kirish</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Security badge footer */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck size={14} className="text-green-700" />
          <span>Himoyalangan Admin Tizimi</span>
        </div>
      </div>
    </div>
  );
};
