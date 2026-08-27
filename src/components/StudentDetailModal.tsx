import React, { useState } from "react";
import {
  X,
  CheckCircle2,
  XCircle,
  Clock,
  HelpCircle,
} from "lucide-react";
import type { ExamResult, Question, Category } from "../types";
import { matchWithNearMiss, langForCategory } from "../utils/answerMatch";

type StudentDetailModalProps = {
  result: ExamResult | null;
  questions: Question[];
  onClose: () => void;
};

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  result,
  questions,
  onClose,
}) => {
  const [selectedCat, setSelectedCat] = useState<Category | "ALL">("ALL");

  const categories: Category[] = ["HTML", "CSS", "JavaScript", "Python"];
  const score = Number(result?.score) || 0;

  // Extract only the question IDs assigned to this student in their exam
  const studentAssignedIds: number[] = result?.category_order
    ? categories.flatMap((c) => result.category_order?.[c] || [])
    : Object.keys(result?.answers || {})
        .filter((k) => k !== "_meta" && !isNaN(Number(k)))
        .map(Number);

  const total = Number(result?.total_points) || (studentAssignedIds.length > 0 ? studentAssignedIds.length : (questions.length > 0 ? questions.length : 120));
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;

  // Filter display questions based on assigned IDs and selected category
  const filteredQuestions: Question[] = (() => {
    if (studentAssignedIds.length > 0) {
      const targetIds = selectedCat === "ALL"
        ? studentAssignedIds
        : (result?.category_order?.[selectedCat] || studentAssignedIds.filter((id) => {
            const q = questions.find((item) => item.id === id);
            return q?.category === selectedCat;
          }));

      return targetIds
        .map((id) => questions.find((q) => q.id === id))
        .filter((q): q is Question => Boolean(q));
    }

    return questions.filter((q) => selectedCat === "ALL" || q.category === selectedCat);
  })();

  if (!result) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-green-700 text-white flex items-center justify-center font-black text-xl shadow-md">
              {result.student_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                {result.student_name}
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                  pct >= 86
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : pct >= 71
                    ? "bg-blue-50 text-blue-800 border-blue-200"
                    : pct >= 56
                    ? "bg-amber-50 text-amber-800 border-amber-200"
                    : "bg-rose-50 text-rose-800 border-rose-200"
                }`}>
                  {pct}% natija
                </span>
              </h2>
              <p className="text-xs text-slate-500 flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1"><Clock size={12} /> {new Date(result.submitted_at || result.created_at).toLocaleString("uz-UZ")}</span>
                <span>•</span>
                <span>Guruh: <strong>{result.group_code || result.answers?._meta?.group_code || "Umumiy"}</strong></span>
                <span>•</span>
                <span>Vaqt: {result.duration_minutes || 60} daqiqa</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Stats Row */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500">To'plangan Ball</span>
            <p className="text-2xl font-black text-emerald-700 mt-1">{score} <span className="text-sm font-normal text-slate-400">/ {total}</span></p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500">Ko'rsatkich (Foiz)</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{pct}%</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500">Qoidabuzarliklar</span>
            <p className={`text-2xl font-black mt-1 ${result.violation_count > 0 ? "text-rose-600" : "text-slate-600"}`}>
              {result.violation_count || 0} ta
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500">Jarima Bali</span>
            <p className="text-2xl font-black text-amber-700 mt-1">-{result.violation_count || 0}</p>
          </div>
        </div>

        {/* Category Tabs Filter */}
        <div className="px-6 py-3 border-b border-slate-200 flex gap-2 overflow-x-auto bg-white">
          <button
            onClick={() => setSelectedCat("ALL")}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              selectedCat === "ALL"
                ? "bg-green-700 text-white"
                : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
            }`}
          >
            Barcha Savollar ({studentAssignedIds.length || questions.length})
          </button>
          {categories.map((cat) => {
            const catCount = result.category_order?.[cat]?.length ?? questions.filter((q) => q.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  selectedCat === cat
                    ? "bg-green-700 text-white"
                    : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                }`}
              >
                {cat} ({catCount})
              </button>
            );
          })}
        </div>

        {/* Detailed Questions Breakdown List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-slate-50">
          {filteredQuestions.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              Bu bo'limda savollar mavjud emas.
            </div>
          ) : (
            filteredQuestions.map((q, idx) => {
              const ans = result.answers?.[q.id] || result.answers?.[String(q.id)];
              let isCorrect = false;
              let isNearMiss = false;
              let studentAnswerText = "Javob berilmadi";
              let correctAnswerText = "—";

              if (q.type === "mcq") {
                const correctIdx = /^[0-9]+$/.test(String(q.answer))
                  ? Number(q.answer)
                  : String(q.answer).toUpperCase().charCodeAt(0) - 65;

                const selectedIdx =
                  ans?.type === "mcq" && ans.selected !== null && ans.selected !== undefined
                    ? Number(ans.selected)
                    : null;

                isCorrect = selectedIdx !== null && selectedIdx === correctIdx;

                studentAnswerText =
                  selectedIdx !== null && q.options?.[selectedIdx] !== undefined
                    ? `${String.fromCharCode(65 + selectedIdx)}) ${q.options[selectedIdx]}`
                    : "Javob berilmadi";

                const correctLetter = String.fromCharCode(65 + Math.max(0, correctIdx));
                const correctText = q.options?.[correctIdx] ?? "";
                correctAnswerText = `${correctLetter}) ${correctText}`;
              } else if (q.type === "truefalse") {
                const expectedBool = q.answer === true || String(q.answer).toLowerCase() === "true";
                const studentBool = ans?.type === "truefalse" && ans.selected !== null ? Boolean(ans.selected) : null;

                isCorrect = studentBool !== null && studentBool === expectedBool;
                studentAnswerText =
                  studentBool !== null
                    ? studentBool ? "To'g'ri (True)" : "Noto'g'ri (False)"
                    : "Javob berilmadi";
                correctAnswerText = expectedBool ? "To'g'ri (True)" : "Noto'g'ri (False)";
              } else if (q.type === "code" || q.type === "fix") {
                const val = ans?.type === q.type ? String(ans.value || "").trim() : "";
                const acceptedList = q.accepted || [];
                const match = matchWithNearMiss(val, acceptedList, langForCategory(q.category));

                isCorrect = match.status === "correct";
                isNearMiss = match.status === "near";
                studentAnswerText = val || "Javob berilmadi";
                correctAnswerText = acceptedList.join("\n--- YOKI ---\n");
              } else if (q.type === "drag") {
                const correctTokens = q.correctOrder || [];
                const allTokens = q.tokens || [];
                const correctOrderIndices = correctTokens.map((t) => allTokens.indexOf(t));
                const studentOrder = ans?.type === "dragdrop" ? ans.order : undefined;
                const touched = ans?.type === "dragdrop" ? ans.touched : false;

                isCorrect =
                  touched &&
                  Array.isArray(studentOrder) &&
                  JSON.stringify(studentOrder) === JSON.stringify(correctOrderIndices);

                studentAnswerText =
                  touched && Array.isArray(studentOrder)
                    ? studentOrder.map((i) => allTokens[i] || `[${i}]`).join("  →  ")
                    : "Javob berilmadi (boshlang'ich holatda qoldirilgan)";
                correctAnswerText = correctTokens.join("  →  ");
              }

              return (
                <div
                  key={q.id}
                  className={`p-5 rounded-2xl border transition-all bg-white shadow-sm ${
                    isCorrect
                      ? "border-emerald-200"
                      : isNearMiss
                      ? "border-amber-300 bg-amber-50/20"
                      : "border-rose-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {q.category} • {q.type.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                        isCorrect
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : isNearMiss
                          ? "bg-amber-50 text-amber-800 border border-amber-300"
                          : "bg-rose-50 text-rose-800 border border-rose-200"
                      }`}>
                        {isCorrect ? (
                          <>
                            <CheckCircle2 size={13} />
                            <span>+{q.points} ball</span>
                          </>
                        ) : isNearMiss ? (
                          <>
                            <HelpCircle size={13} className="text-amber-600" />
                            <span>Deyarli to'g'ri (0 ball)</span>
                          </>
                        ) : (
                          <>
                            <XCircle size={13} />
                            <span>0 ball</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  <p className="font-semibold text-slate-900 text-sm mt-3">{q.question}</p>

                  {/* Code / Fix Broken Code Preview */}
                  {q.type === "fix" && (
                    <div className="mt-3 p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs font-mono text-amber-900">
                      <span className="text-amber-700 block mb-1 text-[11px] font-sans font-semibold">Berilgan xato kod:</span>
                      <pre className="whitespace-pre-wrap">{q.brokenCode}</pre>
                    </div>
                  )}

                  {/* Student Answer vs Correct Answer Box */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-100 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 font-semibold block mb-1">Talabaning Javobi:</span>
                      <pre className={`font-mono whitespace-pre-wrap font-semibold ${
                        isCorrect ? "text-emerald-700" : isNearMiss ? "text-amber-700" : "text-rose-600"
                      }`}>
                        {studentAnswerText}
                      </pre>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200">
                      <span className="text-emerald-800 font-semibold block mb-1">To'g'ri Javob:</span>
                      <pre className="font-mono whitespace-pre-wrap text-emerald-900 font-semibold">
                        {correctAnswerText}
                      </pre>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
