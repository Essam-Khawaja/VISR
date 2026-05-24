"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Upload, Loader2, Check, Link as LinkIcon, X } from "lucide-react";

type ICSImportButtonProps = {
  onImported: () => void;
};

export default function ICSImportButton({ onImported }: ICSImportButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [urlMode, setUrlMode] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!showMenu) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setShowMenu(false);
        setUrlMode(false);
        setError(null);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showMenu]);

  function closeMenu() {
    setShowMenu(false);
    setUrlMode(false);
    setError(null);
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const text = await file.text();
      const res = await fetch("/api/1/ics-import", {
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
      const res = await fetch("/api/1/ics-import", {
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

      {mounted && showMenu && !loading && !result
        ? createPortal(
            <div
              className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-stone-900/30 backdrop-blur-sm p-3 sm:p-6"
              onClick={closeMenu}
              role="dialog"
              aria-modal="true"
              aria-label="Import calendar"
            >
              <div
                className="relative w-full sm:max-w-sm bg-white rounded-3xl shadow-2xl border border-stone-200 max-h-[90dvh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-100 shrink-0 rounded-t-3xl bg-white">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider font-semibold text-stone-500">
                      Add
                    </p>
                    <h2 className="text-sm font-semibold tracking-tight text-stone-900">
                      Import calendar
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={closeMenu}
                    className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-stone-100 text-stone-500"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-2">
                  {!urlMode ? (
                    <>
                      <button
                        onClick={() => inputRef.current?.click()}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-white border border-stone-200 hover:border-stone-400 text-left transition-colors"
                      >
                        <Upload className="w-4 h-4 text-stone-500 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-stone-900">
                            Upload .ics file
                          </p>
                          <p className="text-[11px] text-stone-500">
                            Exported from Google, Apple, or Outlook
                          </p>
                        </div>
                      </button>
                      <button
                        onClick={() => setUrlMode(true)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-white border border-stone-200 hover:border-stone-400 text-left transition-colors"
                      >
                        <LinkIcon className="w-4 h-4 text-stone-500 shrink-0" />
                        <div className="min-w-0">
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
                        Google Calendar → Settings → Integrate → secret address
                        in iCal format. Same idea for iCloud and Outlook.
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
                    <p className="text-[11px] text-rose-600 leading-relaxed">
                      {error}
                    </p>
                  )}
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
