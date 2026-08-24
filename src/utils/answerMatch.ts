import { similarity } from "./diff";
import type { Category } from "../types";

export type CodeLang = "html" | "css" | "js" | "python";

export function langForCategory(category: Category): CodeLang {
  if (category === "HTML") return "html";
  if (category === "CSS") return "css";
  if (category === "JavaScript") return "js";
  return "python";
}

export function canonicalize(source: string, lang: CodeLang): string {
  const src = source.replace(/\r\n?/g, "\n").trim();
  if (!src) return "";
  if (lang === "html") return src.replace(/\s+/g, " ");
  if (lang === "css") return src.replace(/\s+/g, " ").replace(/\s*([{}:;,])\s*/g, "$1");
  return src.replace(/\s+/g, " ");
}

export type MatchStatus = "correct" | "near" | "wrong";

export type MatchResult = {
  status: MatchStatus;
  similarity: number;
  closest?: string;
};

export function matchWithNearMiss(
  studentAnswer: string,
  accepted: string[],
  lang: CodeLang
): MatchResult {
  const student = studentAnswer.trim();
  if (!student) return { status: "wrong", similarity: 0 };

  if (accepted.some((e) => e.trim() === student)) {
    return { status: "correct", similarity: 1, closest: student };
  }

  const canonStudent = canonicalize(student, lang);
  for (const exp of accepted) {
    if (canonicalize(exp, lang) === canonStudent) {
      return { status: "correct", similarity: 1, closest: exp };
    }
  }

  let bestSim = 0;
  let closest = accepted[0];

  for (const exp of accepted) {
    const sim = similarity(student, exp);
    if (sim > bestSim) {
      bestSim = sim;
      closest = exp;
    }
  }

  if (bestSim >= 0.82) {
    return { status: "near", similarity: bestSim, closest };
  }
  return { status: "wrong", similarity: bestSim, closest };
}
