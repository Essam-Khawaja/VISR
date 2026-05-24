import React from "react";

const COMMON_TLDS = [
  "com", "org", "net", "io", "co", "edu", "gov", "app", "dev", "ai",
  "us", "uk", "ca", "au", "me", "tv", "cc", "ly", "so", "sh", "info",
  "xyz", "site", "online", "store", "tech", "us", "biz",
];

const URL_RE = new RegExp(
  [
    "(?:https?:\\/\\/|webcal:\\/\\/)[^\\s<>\"']+",
    "www\\.[^\\s<>\"']+",
    `(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+(?:${COMMON_TLDS.join("|")})(?:\\/[^\\s<>\"']*)?`,
  ].join("|"),
  "gi"
);

function normalizeHref(raw: string): string {
  if (/^[a-z]+:\/\//i.test(raw)) return raw;
  return `https://${raw}`;
}

function trimTrailingPunct(s: string): { url: string; tail: string } {
  const m = s.match(/[.,;:!?)\]}]+$/);
  if (!m) return { url: s, tail: "" };
  return { url: s.slice(0, m.index), tail: m[0] };
}

export function renderTextWithLinks(text: string): React.ReactNode[] {
  if (!text) return [];
  const out: React.ReactNode[] = [];
  let last = 0;
  let key = 0;
  const matches = text.matchAll(URL_RE);
  for (const match of matches) {
    const start = match.index ?? 0;
    const raw = match[0];
    if (start > last) {
      out.push(<span key={`t-${key++}`}>{text.slice(last, start)}</span>);
    }
    const { url, tail } = trimTrailingPunct(raw);
    out.push(
      <a
        key={`l-${key++}`}
        href={normalizeHref(url)}
        target="_blank"
        rel="noopener noreferrer"
        className="text-orange-600 hover:text-orange-700 underline decoration-orange-300 underline-offset-2 break-all"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {url}
      </a>
    );
    if (tail) out.push(<span key={`p-${key++}`}>{tail}</span>);
    last = start + raw.length;
  }
  if (last < text.length) {
    out.push(<span key={`t-${key++}`}>{text.slice(last)}</span>);
  }
  return out;
}
