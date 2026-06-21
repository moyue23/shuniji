import { useEffect, useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { useT, SUPPORTED_LOCALES } from "../i18n";
import * as api from "../utils/tauri";
import { getStoredTheme, setTheme, type Theme } from "../utils/theme";
import type { AppSettings } from "../types";

export default function SettingsPage() {
  const { state, dispatch, refreshAll } = useApp();
  const { t, locale, setLocale } = useT();
  const [config, setConfig] = useState(state.settings);
  const [theme, setThemeState] = useState<Theme>(getStoredTheme);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const themeOptions = useMemo(() => [
    { value: "system" as Theme, label: t("settings.themeSystem") },
    { value: "light" as Theme, label: t("settings.themeLight") },
    { value: "dark" as Theme, label: t("settings.themeDark") },
  ], [t]);

  useEffect(() => {
    if (!config) {
      api.getConfig().then((c) => setConfig(c));
    }
  }, [config]);

  const handleSave = async () => {
    if (!config) return;
    await api.saveConfig(config);
    dispatch({ type: "SET_SETTINGS", payload: config });
  };

  const toggle = (key: keyof AppSettings) => {
    if (!config) return;
    setConfig({ ...config, [key]: !(config as any)[key] });
  };

  const handleChangeStickerPath = async () => {
    const folder = await api.openFolderDialog();
    if (!folder || !config) return;

    const confirmed = await api.confirmDialog(
      t("settings.confirmMigrate"),
      t("settings.confirmMigrateTitle")
    );
    if (confirmed) {
      try {
        const result = await api.migrateStickerStorage(folder);
        setStatusMsg(result);
        await refreshAll();
      } catch (e) {
        setStatusMsg(t("settings.migrationFailed", String(e)));
        return;
      }
    } else {
      const updated = { ...config, sticker_save_path: folder };
      setConfig(updated);
      await api.saveConfig(updated);
      dispatch({ type: "SET_SETTINGS", payload: updated });
      setStatusMsg(t("settings.savePathUpdated"));
    }
    const refreshed = await api.getConfig();
    setConfig(refreshed);
  };

  if (!config) return <div className="settings p-8 overflow-y-auto h-full">{t("common.loading")}</div>;

  return (
    <div className="settings p-8 overflow-y-auto h-full">
      <h2 className="mb-8 text-2xl font-semibold tracking-[-0.01em] leading-8 text-text-main">{t("settings.title")}</h2>

      <section>
        <h3 className="mt-7 mb-4 text-xs font-medium text-text-muted uppercase tracking-wider">{t("settings.paths")}</h3>
        <div className="flex items-center gap-3 px-4 py-3.5 rounded-lg text-sm font-medium transition-colors duration-150 hover:bg-surface-soft mt-1">
          <span className="shrink-0">{t("settings.stickerSavePath")}</span>
          <input className="flex-1 min-w-0 px-3 py-1.5 rounded-md bg-surface-container-lowest text-text-muted text-xs font-mono border border-border-subtle outline-none cursor-default select-all" type="text" readOnly value={config.sticker_save_path} title={config.sticker_save_path} />
          <button className="shrink-0 px-3.5 py-1.5 border border-border-subtle rounded-md bg-surface-container-lowest text-text-main cursor-pointer text-xs font-semibold font-body transition-all duration-150 hover:border-primary hover:text-primary" onClick={handleChangeStickerPath}>{t("settings.chooseFolder")}</button>
        </div>
      </section>

      <section>
        <h3 className="mt-7 mb-4 text-xs font-medium text-text-muted uppercase tracking-wider">{t("settings.appearance")}</h3>
        <div className="flex items-center justify-between px-4 py-3.5 rounded-lg text-sm font-medium transition-colors duration-150 hover:bg-surface-soft mt-1">
          <span>{t("settings.theme")}</span>
          <div className="flex gap-1 bg-surface-soft rounded-md p-0.75">
            {themeOptions.map((opt) => (
              <button
                key={opt.value}
                className={`px-3.5 py-1.25 border-none rounded-sm cursor-pointer text-xs font-semibold font-body transition-all duration-150 hover:text-text-main ${theme === opt.value ? "bg-primary text-on-primary shadow-sm" : "bg-transparent text-text-muted"}`}
                onClick={() => {
                  setThemeState(opt.value);
                  setTheme(opt.value);
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Language switcher */}
        <div className="flex items-center justify-between px-4 py-3.5 rounded-lg text-sm font-medium transition-colors duration-150 hover:bg-surface-soft mt-1">
          <span>{t("settings.language")}</span>
          <div className="flex gap-1 bg-surface-soft rounded-md p-0.75">
            {SUPPORTED_LOCALES.map((l) => (
              <button
                key={l}
                className={`px-3.5 py-1.25 border-none rounded-sm cursor-pointer text-xs font-semibold font-body transition-all duration-150 hover:text-text-main ${locale === l ? "bg-primary text-on-primary shadow-sm" : "bg-transparent text-text-muted"}`}
                onClick={() => setLocale(l)}
              >
                {{ en: "EN", "zh-CN": "简中", "zh-TW": "繁中", ja: "日本語", ko: "한국어" }[l]}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section>
        <h3 className="mt-7 mb-4 text-xs font-medium text-text-muted uppercase tracking-wider">{t("settings.window")}</h3>
        <label className="flex items-center justify-between px-4 py-3.5 rounded-lg text-sm font-medium transition-colors duration-150 hover:bg-surface-soft mt-1">
          <span>{t("settings.enableTray")}</span>
          <input
            className="size-5 cursor-pointer accent-primary"
            type="checkbox"
            checked={config.tray_enabled}
            onChange={() => toggle("tray_enabled")}
          />
        </label>
        <label className="flex items-center justify-between px-4 py-3.5 rounded-lg text-sm font-medium transition-colors duration-150 hover:bg-surface-soft mt-1">
          <span>{t("settings.autostart")}</span>
          <input
            className="size-5 cursor-pointer accent-primary"
            type="checkbox"
            checked={config.autostart_enabled}
            onChange={() => toggle("autostart_enabled")}
          />
        </label>
        <label className="flex items-center justify-between px-4 py-3.5 rounded-lg text-sm font-medium transition-colors duration-150 hover:bg-surface-soft mt-1">
          <span>{t("settings.hotkey")}</span>
          <input
            className="size-5 cursor-pointer accent-primary"
            type="checkbox"
            checked={config.hotkey_enabled}
            onChange={() => toggle("hotkey_enabled")}
          />
        </label>
      </section>

      <section>
        <h3 className="mt-7 mb-4 text-xs font-medium text-text-muted uppercase tracking-wider">{t("settings.about")}</h3>
        <div className="flex items-center justify-between px-4 py-3.5 rounded-lg text-sm font-medium transition-colors duration-150 hover:bg-surface-soft mt-1">
          <a
            className="text-primary no-underline font-semibold hover:underline"
            href="https://github.com/moyue23/shuniji"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </div>
      </section>

      {statusMsg && (
        <div className="mt-6 px-4 py-3 rounded-lg bg-surface-soft text-sm text-text-main border border-border-subtle">{statusMsg}</div>
      )}

      <button className="mt-8 px-8 py-3 border-none rounded-xl bg-primary text-on-primary cursor-pointer text-sm font-bold tracking-[0.02em] font-body shadow-btn transition-all duration-200 hover:bg-primary-hover hover:shadow-[0_12px_28px_rgba(93,57,223,0.35)] hover:-translate-y-0.5" onClick={handleSave}>
        {t("settings.saveSettings")}
      </button>
    </div>
  );
}
