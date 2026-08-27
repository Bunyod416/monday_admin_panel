import { similarity } from "./diff";
import type { Category } from "../types";

export type CodeLang = "html" | "css" | "js" | "py";

export function langForCategory(category: Category): CodeLang {
  if (category === "HTML") return "html";
  if (category === "CSS") return "css";
  if (category === "Python") return "py";
  return "js";
}

export function answersMatch(
  studentAnswer: string,
  accepted: string[],
  lang: CodeLang,
): boolean {
  const student = studentAnswer.trim();
  if (!student) return false;

  if (accepted.some((e) => e.trim() === student)) return true;

  const canonicalStudent = canonicalize(student, lang);
  if (!canonicalStudent) return false;

  return accepted.some((e) => canonicalize(e, lang) === canonicalStudent);
}

export function canonicalize(source: string, lang: CodeLang): string {
  const src = source.replace(/\r\n?/g, "\n").trim();
  if (!src) return "";
  try {
    if (lang === "html") return canonHtml(src);
    if (lang === "css") return canonCss(src);
    if (lang === "py") return canonPy(src);
    return canonJs(src);
  } catch {
    return src.replace(/\s+/g, " ");
  }
}

function canonPy(src: string): string {
  const lines = src.split("\n").map((l) => l.replace(/#.*$/, "").trim()).filter(Boolean);
  return lines
    .map((line) =>
      line
        .replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, '"$1"')
        .replace(/\s*([=+\-*/%:,()[\]{}])\s*/g, "$1")
        .replace(/([A-Za-z0-9_])\s+([A-Za-z0-9_])/g, "$1 $2")
    )
    .join("\n");
}

function canonHtml(src: string): string {
  const parts: string[] = [];
  let i = 0;

  while (i < src.length) {
    if (src[i] === "<") {
      const close = src.indexOf(">", i);
      if (close === -1) {
        parts.push(src.slice(i).replace(/\s+/g, " ").trim());
        break;
      }
      parts.push(canonTag(src.slice(i, close + 1)));
      i = close + 1;
    } else {
      const next = src.indexOf("<", i);
      const text = (next === -1 ? src.slice(i) : src.slice(i, next))
        .replace(/\s+/g, " ")
        .trim();
      if (text) parts.push(text);
      i = next === -1 ? src.length : next;
    }
  }

  return parts.join("");
}

function canonTag(raw: string): string {
  const isClosing = raw.startsWith("</");
  const body = raw
    .slice(isClosing ? 2 : 1, raw.endsWith("/>") ? -2 : -1)
    .trim();

  const head = /^([A-Za-z][A-Za-z0-9-]*)([\s\S]*)$/.exec(body);
  if (!head) return raw.toLowerCase().replace(/\s+/g, " ");

  const name = head[1].toLowerCase();
  if (isClosing) return `</${name}>`;

  const attrs: string[] = [];
  const attrRe = /([^\s=/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
  let m: RegExpExecArray | null;
  while ((m = attrRe.exec(head[2])) !== null) {
    const key = m[1].toLowerCase();
    if (!key) continue;
    const value = m[2] ?? m[3] ?? m[4];
    attrs.push(value === undefined ? key : `${key}="${value}"`);
  }
  attrs.sort();

  return `<${name}${attrs.length ? " " + attrs.join(" ") : ""}>`;
}

function canonCss(src: string): string {
  const noComments = src.replace(/\/\*[\s\S]*?\*\//g, " ");
  const rules: string[] = [];
  const ruleRe = /([^{}]+)\{([^{}]*)\}/g;

  let m: RegExpExecArray | null;
  let found = false;
  while ((m = ruleRe.exec(noComments)) !== null) {
    found = true;
    const selector = m[1]
      .replace(/\s+/g, " ")
      .replace(/\s*([>+~,])\s*/g, "$1")
      .trim();
    const declarations = m[2]
      .split(";")
      .map((d) => d.trim())
      .filter(Boolean)
      .map(canonDeclaration)
      .sort();
    rules.push(`${selector}{${declarations.join(";")}}`);
  }

  if (!found) {
    return noComments
      .split(";")
      .map((d) => d.trim())
      .filter(Boolean)
      .map(canonDeclaration)
      .sort()
      .join(";");
  }

  return rules.sort().join("");
}

function canonDeclaration(declaration: string): string {
  const idx = declaration.indexOf(":");
  if (idx === -1) return declaration.replace(/\s+/g, " ").toLowerCase();

  const property = declaration.slice(0, idx).trim().toLowerCase();
  const value = declaration
    .slice(idx + 1)
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\s*,\s*/g, ",")
    .replace(/\(\s*/g, "(")
    .replace(/\s*\)/g, ")")
    .replace(/#[0-9a-fA-F]{3,8}\b/g, (hex) => hex.toLowerCase());

  return `${property}:${value}`;
}

function canonJs(src: string): string {
  const tokens: string[] = [];
  let i = 0;

  while (i < src.length) {
    const c = src[i];

    if (/\s/.test(c)) { i++; continue; }

    if (c === "/" && src[i + 1] === "/") {
      while (i < src.length && src[i] !== "\n") i++;
      continue;
    }
    if (c === "/" && src[i + 1] === "*") {
      i += 2;
      while (i < src.length && !(src[i] === "*" && src[i + 1] === "/")) i++;
      i += 2;
      continue;
    }

    if (c === '"' || c === "'" || c === "`") {
      let j = i + 1;
      let value = "";
      while (j < src.length && src[j] !== c) {
        if (src[j] === "\\") { value += src[j] + src[j + 1]; j += 2; }
        else { value += src[j]; j++; }
      }
      tokens.push(JSON.stringify(unescapeLoose(value)));
      i = j + 1;
      continue;
    }

    if (c === ";") { i++; continue; }

    if (/[A-Za-z0-9_$]/.test(c)) {
      let j = i;
      while (j < src.length && /[A-Za-z0-9_$]/.test(src[j])) j++;
      tokens.push(src.slice(i, j));
      i = j;
      continue;
    }

    tokens.push(c);
    i++;
  }

  let out = "";
  for (const token of tokens) {
    const prev = out[out.length - 1];
    if (prev && /[A-Za-z0-9_$]/.test(prev) && /^[A-Za-z0-9_$]/.test(token)) {
      out += " ";
    }
    out += token;
  }
  return out;
}

function unescapeLoose(value: string): string {
  return value.replace(/\\(.)/g, (_, ch: string) =>
    ch === "n" ? "\n" : ch === "t" ? "\t" : ch === "r" ? "\r" : ch,
  );
}

export type MatchStatus = "correct" | "near" | "wrong";

export type MatchResult = {
  status: MatchStatus;
  closest: string;
  similarity: number;
};

export const NEAR_MISS_THRESHOLD = 0.82;

export function matchWithNearMiss(
  studentAnswer: string,
  accepted: string[],
  lang: CodeLang,
): MatchResult {
  const student = studentAnswer.trim();

  if (answersMatch(student, accepted, lang)) {
    return { status: "correct", closest: accepted[0] ?? "", similarity: 1 };
  }

  const canonicalStudent = canonicalize(student, lang);
  let closest = accepted[0] ?? "";
  let best = 0;

  for (const candidate of accepted) {
    const score = similarity(canonicalize(candidate, lang), canonicalStudent);
    if (score > best) {
      best = score;
      closest = candidate;
    }
  }

  return {
    status: student && best >= NEAR_MISS_THRESHOLD ? "near" : "wrong",
    closest,
    similarity: best,
  };
}
