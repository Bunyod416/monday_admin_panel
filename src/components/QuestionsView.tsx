import React, { useState } from "react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { Plus, Search, Edit3, Trash2, FileJson, FileText, X, Upload } from "lucide-react";
import type { Question, Category, QuestionType } from "../types";

GlobalWorkerOptions.workerSrc = pdfWorker;

type QuestionsViewProps = {
  questions: Question[];
  onAddQuestion: () => void;
  onEditQuestion: (q: Question) => void;
  onDeleteQuestion: (id: number) => void;
  onImportQuestions: (questions: Question[]) => Promise<void>;
};

export const QuestionsView: React.FC<QuestionsViewProps> = ({
  questions,
  onAddQuestion,
  onEditQuestion,
  onDeleteQuestion,
  onImportQuestions,
}) => {
  const [selectedCat, setSelectedCat] = useState<Category | "ALL">("ALL");
  const [selectedType, setSelectedType] = useState<QuestionType | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [jsonOpen, setJsonOpen] = useState(false);
  const [jsonText, setJsonText] = useState(QUESTION_JSON_EXAMPLE);
  const [jsonError, setJsonError] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [pdfError, setPdfError] = useState("");

  const categories: Category[] = ["HTML", "CSS", "JavaScript", "Python"];

  async function handleJsonImport() {
    setJsonError("");
    setIsImporting(true);
    try {
      const parsed: unknown = JSON.parse(jsonText);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      if (items.length === 0) throw new Error("JSON ichida kamida bitta savol bo'lishi kerak.");

      const nextId = questions.length > 0 ? Math.max(...questions.map((q) => q.id)) + 1 : 1;
      const imported = items.map((item, index) => parseQuestion(item, nextId + index));
      await onImportQuestions(imported);
      setJsonOpen(false);
    } catch (error) {
      setJsonError(error instanceof Error ? error.message : "JSON formatini tekshiring.");
    } finally {
      setIsImporting(false);
    }
  }

  async function handlePdfImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setPdfError("");
    setIsImporting(true);
    try {
      const data = new Uint8Array(await file.arrayBuffer());
      const document = await getDocument({ data }).promise;
      let extractedText = "";

      for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
        const page = await document.getPage(pageNumber);
        const content = await page.getTextContent();
        extractedText += `${content.items
          .map((item) => ("str" in item ? item.str : ""))
          .join(" ")}\n`;
      }

      const parsed: unknown = JSON.parse(extractedText.trim());
      const items = Array.isArray(parsed) ? parsed : [parsed];
      if (items.length === 0) throw new Error("PDF ichida kamida bitta savol bo'lishi kerak.");

      const nextId = questions.length > 0 ? Math.max(...questions.map((q) => q.id)) + 1 : 1;
      const imported = items.map((item, index) => parseQuestion(item, nextId + index));
      await onImportQuestions(imported);
      setPdfOpen(false);
    } catch (error) {
      setPdfError(error instanceof Error ? error.message : "PDF ichidagi JSON formatini tekshiring.");
    } finally {
      setIsImporting(false);
    }
  }

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
            onClick={() => {
              setJsonError("");
              setJsonOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
          >
            <FileJson size={16} />
            <span>JSON orqali qo'shish</span>
          </button>

          <button
            onClick={() => {
              setPdfError("");
              setPdfOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-all cursor-pointer"
          >
            <FileText size={16} />
            <span>PDF orqali qo'shish</span>
          </button>

          <button
            onClick={onAddQuestion}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-green-700 hover:bg-green-800 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>Yangi Savol Qo'shish</span>
          </button>
        </div>
      </div>

      {jsonOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
              <div>
                <h2 className="text-xl font-bold text-slate-900">JSON orqali savol qo'shish</h2>
                <p className="text-xs text-slate-500 mt-1">Bitta obyekt yoki obyektlar massivini joylashtiring. `id` berilmasa avtomatik beriladi.</p>
              </div>
              <button onClick={() => setJsonOpen(false)} className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-500 border border-slate-200 cursor-pointer" title="Yopish">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                rows={16}
                spellCheck={false}
                className="w-full rounded-2xl border border-slate-200 bg-slate-950 p-4 text-xs leading-5 text-emerald-300 font-mono outline-none focus:border-green-600"
              />
              {jsonError && <p className="rounded-xl bg-rose-50 border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700">{jsonError}</p>}
              <p className="text-xs text-slate-500">`type`: `mcq`, `truefalse`, `code`, `drag` yoki `fix`. Ko'p savol uchun obyektlarni `[...]` ichiga yozing.</p>
            </div>

            <div className="p-5 border-t border-slate-200 flex justify-end gap-2">
              <button onClick={() => setJsonOpen(false)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer">Bekor qilish</button>
              <button onClick={handleJsonImport} disabled={isImporting} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white text-xs font-bold cursor-pointer">
                <Upload size={15} /> {isImporting ? "Saqlanmoqda..." : "Bazaga qo'shish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {pdfOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
              <div>
                <h2 className="text-xl font-bold text-slate-900">PDF orqali savol qo'shish</h2>
                <p className="text-xs text-slate-500 mt-1">PDF ichida JSON namunasidagi savol yoki savollar massivi bo'lishi kerak.</p>
              </div>
              <button onClick={() => setPdfOpen(false)} className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-500 border border-slate-200 cursor-pointer" title="Yopish">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <label className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-rose-200 bg-rose-50/50 p-8 text-center cursor-pointer hover:bg-rose-50 transition-colors">
                <FileText size={30} className="text-rose-600" />
                <span className="text-sm font-bold text-slate-800">PDF faylni tanlang</span>
                <span className="text-xs text-slate-500">PDF matni JSON formatida bo'lishi kerak</span>
                <input type="file" accept="application/pdf,.pdf" onChange={handlePdfImport} disabled={isImporting} className="sr-only" />
              </label>

              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">PDF ichiga qo'yiladigan namuna</p>
                <pre className="max-h-56 overflow-auto rounded-2xl bg-slate-950 p-4 text-[11px] leading-5 text-emerald-300">{QUESTION_JSON_EXAMPLE}</pre>
              </div>
              {pdfError && <p className="rounded-xl bg-rose-50 border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700">{pdfError}</p>}
              {isImporting && <p className="text-xs font-semibold text-slate-500">PDF o'qilmoqda va savollar saqlanmoqda...</p>}
            </div>

            <div className="p-5 border-t border-slate-200 flex justify-end">
              <button onClick={() => setPdfOpen(false)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer">Bekor qilish</button>
            </div>
          </div>
        </div>
      )}

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCat("ALL")}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${selectedCat === "ALL"
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
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${selectedCat === cat
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

const QUESTION_JSON_EXAMPLE = `{
  "type": "mcq",
  "category": "HTML",
  "topic": "HTML asoslari",
  "question": "HTML nimani anglatadi?",
  "options": [
    "HyperText Markup Language",
    "HighText Machine Language",
    "Hyperlink Text Management Language",
    "Home Tool Markup Language"
  ],
  "answer": "A",
  "hint": "Veb sahifa tuzilmasini belgilaydi.",
  "points": 1
}`;

function parseQuestion(value: unknown, fallbackId: number): Question {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Har bir savol JSON obyekti bo'lishi kerak.");
  const item = value as Record<string, unknown>;
  const type = item.type;
  const category = item.category;
  if (!(["mcq", "truefalse", "code", "drag", "fix"] as string[]).includes(String(type))) throw new Error("type noto'g'ri yoki ko'rsatilmagan.");
  if (!(["HTML", "CSS", "JavaScript", "Python"] as string[]).includes(String(category))) throw new Error("category HTML, CSS, JavaScript yoki Python bo'lishi kerak.");
  if (typeof item.question !== "string" || !item.question.trim()) throw new Error("question majburiy.");

  const base = {
    id: typeof item.id === "number" && Number.isFinite(item.id) ? item.id : fallbackId,
    category: category as Category,
    topic: typeof item.topic === "string" && item.topic.trim() ? item.topic.trim() : "Umumiy",
    question: item.question.trim(),
    hint: typeof item.hint === "string" ? item.hint : "",
    points: typeof item.points === "number" && item.points > 0 ? item.points : 1,
  };

  if (type === "mcq") {
    if (!Array.isArray(item.options) || item.options.length < 2 || !item.options.every((o) => typeof o === "string" && o.trim())) throw new Error("mcq uchun options massivini kiriting.");
    return { ...base, type: "mcq", options: item.options.map(String), answer: typeof item.answer === "string" ? item.answer : "A" };
  }
  if (type === "truefalse") return { ...base, type: "truefalse", answer: item.answer === true || item.answer === "true" };
  if (type === "code") return { ...base, type: "code", placeholder: typeof item.placeholder === "string" ? item.placeholder : "", accepted: stringArray(item.accepted, "accepted") };
  if (type === "drag") return { ...base, type: "drag", tokens: stringArray(item.tokens, "tokens"), correctOrder: stringArray(item.correctOrder ?? item.correct_order, "correctOrder") };
  return { ...base, type: "fix", brokenCode: typeof item.brokenCode === "string" ? item.brokenCode : String(item.broken_code ?? ""), accepted: stringArray(item.accepted, "accepted") };
}

function stringArray(value: unknown, field: string): string[] {
  if (!Array.isArray(value) || value.length === 0 || !value.every((item) => typeof item === "string" && item.trim())) throw new Error(`${field} massivini kiriting.`);
  return value.map(String);
}
