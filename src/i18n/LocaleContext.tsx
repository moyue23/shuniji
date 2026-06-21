import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react";
import type { Locale, TranslationKey } from "./types";
import { translations } from "./translations";
import * as api from "../utils/tauri";

// --- Language detection ---
function detectLocale(): Locale {
  const nav = navigator.language;
  if (nav.startsWith("zh")) {
    // Differentiate Simplified vs Traditional
    if (nav.includes("Hant") || nav.includes("TW") || nav.includes("HK") || nav.includes("MO")) {
      return "zh-TW";
    }
    return "zh-CN";
  }
  if (nav.startsWith("ja")) return "ja";
  if (nav.startsWith("ko")) return "ko";
  return "en";
}

function isValidLocale(s: string): s is Locale {
  return ["en", "zh-CN", "zh-TW", "ja", "ko"].includes(s);
}

// --- Context shape ---
interface LocaleContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: TranslationKey, ...args: (string | number)[]) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(detectLocale);

  // On mount: read config. If language is missing/invalid, persist detected locale.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const cfg = await api.getConfig();
        if (cancelled) return;
        if (cfg.language && isValidLocale(cfg.language)) {
          setLocaleState(cfg.language as Locale);
        } else {
          // First launch or corrupted — persist detected locale
          const detected = detectLocale();
          setLocaleState(detected);
          await api.saveConfig({ ...cfg, language: detected });
        }
      } catch {
        // Config not available yet, keep detected locale
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const setLocale = useCallback(async (l: Locale) => {
    setLocaleState(l);
    try {
      const cfg = await api.getConfig();
      await api.saveConfig({ ...cfg, language: l });
    } catch { /* best-effort persist */ }
  }, []);

  const t = useCallback(
    (key: TranslationKey, ...args: (string | number)[]): string => {
      let template = translations[locale]?.[key];
      if (template === undefined) {
        // Fallback to English for missing keys
        template = translations.en[key] ?? key;
      }
      if (args.length === 0) return template;
      return template.replace(/\{(\d+)\}/g, (_, idx) => String(args[Number(idx)] ?? ""));
    },
    [locale]
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useT() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useT must be used within LocaleProvider");
  return ctx;
}
