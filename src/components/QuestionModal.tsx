import React, { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import type { Question, Category, QuestionType } from "../types";

type QuestionModalProps = {
  isOpen: boolean;
  question: Question | null;
  existingQuestions?: Question[];
  onClose: () => void;
  onSave: (question: Question) => Promise<void>;
};

export const QuestionModal: React.FC<QuestionModalProps> = ({
  isOpen,
  question,
  existingQuestions = [],
  onClose,
  onSave,
}) => {
  const nextId = existingQuestions.length > 0
    ? Math.max(...existingQuestions.map((q) => q.id)) + 1
    : 1;
  const id = question ? question.id : nextId;
  const [category, setCategory] = useState<Category>(question ? question.category : "HTML");
  const [type, setType] = useState<QuestionType>(question ? question.type : "mcq");
  const [topic, setTopic] = useState<string>(question ? question.topic : "");
  const [questionText, setQuestionText] = useState<string>(question ? question.question : "");
  const [hint, setHint] = useState<string>(question ? question.hint : "");
  const [points, setPoints] = useState<number>(question ? question.points : 1);

  const [mcqOptions, setMcqOptions] = useState<string[]>(
    question?.type === "mcq" && Array.isArray(question.options) ? question.options : ["", "", "", ""]
  );
  const [mcqAnswer, setMcqAnswer] = useState<string>(
    question?.type === "mcq" ? String(question.answer || "A") : "A"
  );

  const [tfAnswer, setTfAnswer] = useState<boolean>(
    question?.type === "truefalse" ? Boolean(question.answer) : true
  );

  const [codePlaceholder, setCodePlaceholder] = useState<string>(
    question?.type === "code" ? question.placeholder || "" : ""
  );
  const [codeAccepted, setCodeAccepted] = useState<string>(
    question?.type === "code" ? (Array.isArray(question.accepted) ? question.accepted.join("\n---YOKI---\n") : String(question.accepted || "")) : ""
  );

  const [dragTokens, setDragTokens] = useState<string>(
    question?.type === "drag" ? (Array.isArray(question.tokens) ? question.tokens.join(", ") : String(question.tokens || "")) : ""
  );
  const [dragCorrectOrder, setDragCorrectOrder] = useState<string>(
    question?.type === "drag" ? (Array.isArray(question.correctOrder) ? question.correctOrder.join(", ") : String(question.correctOrder || "")) : ""
  );

  const [fixBrokenCode, setFixBrokenCode] = useState<string>(
    question?.type === "fix" ? question.brokenCode || "" : ""
  );
  const [fixAccepted, setFixAccepted] = useState<string>(
    question?.type === "fix" ? (Array.isArray(question.accepted) ? question.accepted.join("\n---YOKI---\n") : String(question.accepted || "")) : ""
  );

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (question) {
      setCategory(question.category);
      setType(question.type);
      setTopic(question.topic || "");
      setQuestionText(question.question || "");
      setHint(question.hint || "");
      setPoints(question.points || 1);
      setMcqOptions(question.type === "mcq" && Array.isArray(question.options) ? question.options : ["", "", "", ""]);
      setMcqAnswer(question.type === "mcq" ? String(question.answer || "A") : "A");
      setTfAnswer(question.type === "truefalse" ? Boolean(question.answer) : true);
      setCodePlaceholder(question.type === "code" ? question.placeholder || "" : "");
      setCodeAccepted(question.type === "code" ? (Array.isArray(question.accepted) ? question.accepted.join("\n---YOKI---\n") : String(question.accepted || "")) : "");
      setDragTokens(question.type === "drag" ? (Array.isArray(question.tokens) ? question.tokens.join(", ") : String(question.tokens || "")) : "");
      setDragCorrectOrder(question.type === "drag" ? (Array.isArray(question.correctOrder) ? question.correctOrder.join(", ") : String(question.correctOrder || "")) : "");
      setFixBrokenCode(question.type === "fix" ? question.brokenCode || "" : "");
      setFixAccepted(question.type === "fix" ? (Array.isArray(question.accepted) ? question.accepted.join("\n---YOKI---\n") : String(question.accepted || "")) : "");
    } else {
      setCategory("HTML");
      setType("mcq");
      setTopic("");
      setQuestionText("");
      setHint("");
      setPoints(1);
      setMcqOptions(["", "", "", ""]);
      setMcqAnswer("A");
      setTfAnswer(true);
      setCodePlaceholder("");
      setCodeAccepted("");
      setDragTokens("");
      setDragCorrectOrder("");
      setFixBrokenCode("");
      setFixAccepted("");
    }
  }, [question, isOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      let constructed: Question;

      if (type === "mcq") {
        constructed = {
          id,
          type: "mcq",
          category,
          topic: topic.trim() || "Umumiy",
          question: questionText.trim(),
          options: mcqOptions.map((o) => o.trim()),
          answer: mcqAnswer,
          hint: hint.trim(),
          points: Number(points) || 1,
        };
      } else if (type === "truefalse") {
        constructed = {
          id,
          type: "truefalse",
          category,
          topic: topic.trim() || "Umumiy",
          question: questionText.trim(),
          answer: tfAnswer,
          hint: hint.trim(),
          points: Number(points) || 1,
        };
      } else if (type === "code") {
        constructed = {
          id,
          type: "code",
          category,
          topic: topic.trim() || "Umumiy",
          question: questionText.trim(),
          placeholder: codePlaceholder.trim(),
          accepted: codeAccepted.split("\n---YOKI---\n").map((s) => s.trim()).filter(Boolean),
          hint: hint.trim(),
          points: Number(points) || 1,
        };
      } else if (type === "drag") {
        constructed = {
          id,
          type: "drag",
          category,
          topic: topic.trim() || "Umumiy",
          question: questionText.trim(),
          tokens: dragTokens.split(",").map((s) => s.trim()).filter(Boolean),
          correctOrder: dragCorrectOrder.split(",").map((s) => s.trim()).filter(Boolean),
          hint: hint.trim(),
          points: Number(points) || 1,
        };
      } else {
        constructed = {
          id,
          type: "fix",
          category,
          topic: topic.trim() || "Umumiy",
          question: questionText.trim(),
          brokenCode: fixBrokenCode,
          accepted: fixAccepted.split("\n---YOKI---\n").map((s) => s.trim()).filter(Boolean),
          hint: hint.trim(),
          points: Number(points) || 1,
        };
      }

      await onSave(constructed);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Savolni saqlashda xatolik yuz berdi");
    } finally {
      setIsSaving(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {question ? "Savolni Tahrirlash" : "Yangi Savol Qo'shish"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Supabase bazasiga avtomatik yoziladi</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-sm text-slate-700">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Bo'lim (Kategoriya)</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-semibold outline-none focus:bg-white focus:border-green-600"
              >
                <option value="HTML">HTML</option>
                <option value="CSS">CSS</option>
                <option value="JavaScript">JavaScript</option>
                <option value="Python">Python</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Savol Turi</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as QuestionType)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-semibold outline-none focus:bg-white focus:border-green-600"
              >
                <option value="mcq">MCQ (4 ta variant)</option>
                <option value="truefalse">True/False (To'g'ri/Noto'g'ri)</option>
                <option value="code">Kod Yozish</option>
                <option value="drag">Drag & Drop (Tokenlar)</option>
                <option value="fix">Kod Xatosini Tuzatish</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Ball</label>
              <input
                type="number"
                min={1}
                max={20}
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-semibold outline-none focus:bg-white focus:border-green-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Mavzu (Topic)</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Masalan: Flexbox, DOM, Sikllar..."
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 outline-none focus:bg-white focus:border-green-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Savol Matni</label>
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Savol matnini yozing..."
              rows={3}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-900 outline-none focus:bg-white focus:border-green-600 font-medium"
            />
          </div>

          {type === "mcq" && (
            <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-green-800 uppercase tracking-wider block mb-2">Variantlar</span>
              {["A", "B", "C", "D"].map((letter, idx) => (
                <div key={letter} className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-white text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200 shadow-sm">
                    {letter}
                  </span>
                  <input
                    type="text"
                    value={mcqOptions[idx] || ""}
                    onChange={(e) => {
                      const copy = [...mcqOptions];
                      copy[idx] = e.target.value;
                      setMcqOptions(copy);
                    }}
                    placeholder={`${letter} varianti matni...`}
                    required
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs outline-none focus:border-green-600"
                  />
                  <input
                    type="radio"
                    name="mcqCorrect"
                    checked={mcqAnswer === letter}
                    onChange={() => setMcqAnswer(letter)}
                    className="w-4 h-4 accent-green-700 cursor-pointer"
                    title="To'g'ri javob sifatida belgilash"
                  />
                </div>
              ))}
            </div>
          )}

          {type === "truefalse" && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-green-800 uppercase tracking-wider block mb-2">To'g'ri Javob</span>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="tfCorrect"
                    checked={tfAnswer === true}
                    onChange={() => setTfAnswer(true)}
                    className="w-4 h-4 accent-green-700"
                  />
                  <span className="font-semibold text-emerald-800">To'g'ri (True)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="tfCorrect"
                    checked={tfAnswer === false}
                    onChange={() => setTfAnswer(false)}
                    className="w-4 h-4 accent-green-700"
                  />
                  <span className="font-semibold text-rose-800">Noto'g'ri (False)</span>
                </label>
              </div>
            </div>
          )}

          {type === "code" && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Boshlang'ich kod (Placeholder)</label>
                <input
                  type="text"
                  value={codePlaceholder}
                  onChange={(e) => setCodePlaceholder(e.target.value)}
                  placeholder="<!-- Kodingizni yozing -->"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Qabul qilinadigan to'g'ri kodlar (Bir nechtasi bo'lsa ---YOKI--- bilan ajrating):
                </label>
                <textarea
                  value={codeAccepted}
                  onChange={(e) => setCodeAccepted(e.target.value)}
                  rows={4}
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-emerald-800 font-mono outline-none focus:border-green-600"
                />
              </div>
            </div>
          )}

          {type === "drag" && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Tokenlar ro'yxati (vergul bilan ajrating):</label>
                <input
                  type="text"
                  value={dragTokens}
                  onChange={(e) => setDragTokens(e.target.value)}
                  placeholder="<a>, href='...', >, Matn, </a>"
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">To'g'ri tartibdagi tokenlar (vergul bilan ajrating):</label>
                <input
                  type="text"
                  value={dragCorrectOrder}
                  onChange={(e) => setDragCorrectOrder(e.target.value)}
                  placeholder="<a>, href='...', >, Matn, </a>"
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-emerald-800 font-mono"
                />
              </div>
            </div>
          )}

          {type === "fix" && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Xatosi bor dastlabki kod:</label>
                <textarea
                  value={fixBrokenCode}
                  onChange={(e) => setFixBrokenCode(e.target.value)}
                  rows={3}
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-amber-900 font-mono outline-none focus:border-green-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Tuzatilgan to'g'ri kodlar (---YOKI--- bilan ajrating):</label>
                <textarea
                  value={fixAccepted}
                  onChange={(e) => setFixAccepted(e.target.value)}
                  rows={3}
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-emerald-800 font-mono outline-none focus:border-green-600"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Maslahat (Hint)</label>
            <input
              type="text"
              value={hint}
              onChange={(e) => setHint(e.target.value)}
              placeholder="Yordamchi eslatma matni..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 outline-none focus:bg-white focus:border-green-600"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
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
              <span>{isSaving ? "Saqlanmoqda..." : "Saqlash"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
