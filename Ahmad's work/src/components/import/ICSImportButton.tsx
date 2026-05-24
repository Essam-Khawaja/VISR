"use client";

import { useRef, useState } from "react";
import { Upload, Loader2, Check, Link as LinkIcon, X } from "lucide-react";

type ICSImportButtonProps = {
  onImported: () => void;
};

export default function ICSImportButton({ onImported }: ICSImportButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [urlMode, setUrlMode] = useState(false);
  const [url, setUrl] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const text = await file.text();
      const res = await fetch("/api/ics-import", {
        method: "POST",
        headers: { "Content-Type": "text/calendar" },
        body: text,
      });
      if (res.ok) {
        const data = await res.json();
        setResult(`Imported ${data.imported}`);
        onImported();
        setTimeout(() => {
          setResult(null);
          setShowMenu(false);
        }, 3000);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Import failed");
      }
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleUrl(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch("/api/ics-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult(`Imported ${data.imported}`);
        setUrl("");
        onImported();
        setTimeout(() => {
          setResult(null);
          setShowMenu(false);
          setUrlMode(false);
        }, 3000);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Couldn't read that calendar");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".ics,text/calendar"
        onChange={handleFile}
        className="hidden"
      />
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={loading}
        className="text-xs font-medium px-3 py-1.5 rounded-xl btn-ghost flex items-center gap-1.5 disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : result ? (
          <Check className="w-3.5 h-3.5 text-emerald-600" />
        ) : (
          <Upload className="w-3.5 h-3.5" />
        )}
        {loading ? "Importing..." : result ?? "Import"}
      </button>

      {showMenu && !loading && !result && (
        <div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/30 p-4"
          onClick={() => {
            setShowMenu(false);
            setUrlMode(false);
            setError(null);
          }}
        >
          <div
            className="w-full sm:w-80 bg-white border border-stone-200 rounded-2xl shadow-2xl p-3 space-y-2 max-h-[90dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-stone-900">
              Import calendar
            </p>
            <button
              onClick={() => {
                setShowMenu(false);
                setUrlMode(false);
                setError(null);
              }}
              className="text-stone-400 hover:text-stone-900"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {!urlMode ? (
            <>
              <button
                onClick={() => inputRef.current?.click()}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-stone-200 hover:border-stone-400 text-left"
              >
                <Upload className="w-4 h-4 text-stone-500" />
                <div>
                  <p className="text-sm font-medium text-stone-900">
                    Upload .ics file
                  </p>
                  <p className="text-[11px] text-stone-500">
                    Exported from Google, Apple, Outlook
                  </p>
                </div>
              </button>
              <button
                onClick={() => setUrlMode(true)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-stone-200 hover:border-stone-400 text-left"
              >
                <LinkIcon className="w-4 h-4 text-stone-500" />
                <div>
                  <p className="text-sm font-medium text-stone-900">
                    From URL
                  </p>
                  <p className="text-[11px] text-stone-500">
                    Google secret address, iCloud webcal, etc.
                  </p>
                </div>
              </button>
            </>
          ) : (
            <form onSubmit={handleUrl} className="space-y-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://...ics or webcal://..."
                className="w-full input-soft text-xs"
                autoFocus
              />
              <p className="text-[10px] text-stone-500 leading-relaxed">
                Google Calendar → Settings → Integrate → secret address in iCal
                format. Same idea for iCloud and Outlook.
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setUrlMode(false)}
                  className="flex-1 px-3 py-1.5 rounded-xl btn-ghost text-xs font-medium"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={!url.trim()}
                  className="flex-1 px-3 py-1.5 rounded-xl btn-primary text-xs font-medium disabled:opacity-50"
                >
                  Import
                </button>
              </div>
            </form>
          )}

          {error && (
            <p className="text-[11px] text-rose-600 leading-relaxed">{error}</p>
          )}
          </div>
        </div>
      )}
    </>
  );
}
