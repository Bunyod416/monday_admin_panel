import React, { useState } from "react";
import { Plus, Search, Edit3, Trash2 } from "lucide-react";
import type { Question, Category, QuestionType } from "../types";

type QuestionsViewProps = {
  questions: Question[];
  onAddQuestion: () => void;
  onEditQuestion: (q: Question) => void;
  onDeleteQuestion: (id: number) => void;
};

export const QuestionsView: React.FC<QuestionsViewProps> = ({
  questions,
  onAddQuestion,
  onEditQuestion,
  onDeleteQuestion,
}) => {
  const [selectedCat, setSelectedCat] = useState<Category | "ALL">("ALL");
  const [selectedType, setSelectedType] = useState<QuestionType | "ALL">("ALL");
  const [search, setSearch] = useState("");

  const categories: Category[] = ["HTML", "CSS", "JavaScript", "Python"];

  const filtered = questions.filter((q) => {
    const catMatches = selectedCat === "ALL" || q.category === selectedCat;
    const typeMatches = selectedType === "ALL" || q.type === selectedType;
    const searchMatches =
      q.question.toLowerCase().includes(search.toLowerCase()) ||
      q.topic.toLowerCase().includes(search.toLowerCase());
    return catMatches && typeMatches && searchMatches;
  });

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:w-80">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Savol yoki mavzuni qidirish..."
            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-green-600 rounded-2xl pl-11 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs text-slate-700 outline-none font-medium cursor-pointer"
          >
            <option value="ALL">Barcha Turlar</option>
            <option value="mcq">MCQ (Variantli)</option>
            <option value="truefalse">True / False</option>
            <option value="code">Kod Yozish</option>
            <option value="drag">Drag & Drop</option>
            <option value="fix">Kod Tuzatish</option>
          </select>

          <button
            onClick={onAddQuestion}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-green-700 hover:bg-green-800 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>Yangi Savol Qo'shish</span>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCat("ALL")}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            selectedCat === "ALL"
              ? "bg-green-700 text-white shadow-sm"
              : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          Barcha Fanlar ({questions.length})
        </button>
        {categories.map((cat) => {
          const count = questions.filter((q) => q.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                selectedCat === cat
                  ? "bg-green-700 text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Questions List */}
      <div className="grid grid-cols-1 gap-4">
        {filtered.length === 0 ? (
          <div className="p-16 rounded-3xl bg-white border border-slate-200 text-center text-slate-400">
            Mos keluvchi savollar topilmadi.
          </div>
        ) : (
          filtered.map((q) => (
            <div
              key={q.id}
              className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-slate-300 transition-all shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 font-bold text-xs text-slate-600 border border-slate-200">
                    ID: {q.id}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200">
                    {q.category}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-800 font-bold text-xs border border-blue-200 uppercase">
                    {q.type}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">• {q.topic}</span>
                </div>
                <p className="font-semibold text-slate-900 text-sm">{q.question}</p>
                {q.hint && <p className="text-xs text-slate-500 italic">💡 Maslahat: {q.hint}</p>}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  onClick={() => onEditQuestion(q)}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
                  title="Tahrirlash"
                >
                  <Edit3 size={15} />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`ID ${q.id} savolini o'chirishni xohlaysizmi?`)) {
                      onDeleteQuestion(q.id);
                    }
                  }}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 transition-colors cursor-pointer"
                  title="O'chirish"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
