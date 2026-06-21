export type Locale = "en" | "zh-CN" | "zh-TW" | "ja" | "ko";

export const SUPPORTED_LOCALES: Locale[] = ["en", "zh-CN", "zh-TW", "ja", "ko"];

// TranslationKey is derived from the English translations object (the source of truth)
import type { en } from "./translations";
export type TranslationKey = keyof typeof en;
