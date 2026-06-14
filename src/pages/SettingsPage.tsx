import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import * as api from "../utils/tauri";
import { getStoredTheme, setTheme, type Theme } from "../utils/theme";
import type { AppSettings } from "../types";

const THEME_OPTIONS: { value: Theme; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

export default function SettingsPage() {
  const { state, dispatch } = useApp();
  const [config, setConfig] = useState(state.settings);
  const [theme, setThemeState] = useState<Theme>(getStoredTheme);

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

  if (!config) return <div className="settings p-8 overflow-y-auto h-full">Loading...</div>;

  return (
    <div className="settings p-8 overflow-y-auto h-full">
      <h2 className="mb-8 text-2xl font-semibold tracking-[-0.01em] leading-8 text-text-main">Settings</h2>

      <section>
        <h3 className="mt-7 mb-4 text-xs font-medium text-text-muted uppercase tracking-wider">Paths</h3>
        <div className="flex items-center gap-3 px-4 py-3.5 rounded-lg text-sm font-medium transition-colors duration-150 hover:bg-surface-soft mt-1">
          <span className="shrink-0">Sticker save path</span>
          <input className="flex-1 min-w-0 px-3 py-1.5 rounded-md bg-surface-container-lowest text-text-muted text-xs font-mono border border-border-subtle outline-none cursor-default select-all" type="text" readOnly value={config.sticker_save_path} title={config.sticker_save_path} />
          <button className="shrink-0 px-3.5 py-1.5 border border-border-subtle rounded-md bg-surface-container-lowest text-text-main cursor-pointer text-xs font-semibold font-body transition-all duration-150 hover:border-primary hover:text-primary" onClick={async () => {
            const folder = await api.openFolderDialog();
            if (folder) {
              const updated = { ...config, sticker_save_path: folder };
              setConfig(updated);
              await api.saveConfig(updated);
              dispatch({ type: "SET_SETTINGS", payload: updated });
            }
          }}>Choose Folder</button>
        </div>
        <div className="flex items-center gap-3 px-4 py-3.5 rounded-lg text-sm font-medium transition-colors duration-150 hover:bg-surface-soft mt-1">
          <span className="shrink-0">Database path</span>
          <input className="flex-1 min-w-0 px-3 py-1.5 rounded-md bg-surface-container-lowest text-text-muted text-xs font-mono border border-border-subtle outline-none cursor-default select-all" type="text" readOnly value={config.db_path.replace(/[\\/][^\\/]+$/, '')} title={config.db_path.replace(/[\\/][^\\/]+$/, '')} />
          <button className="shrink-0 px-3.5 py-1.5 border border-border-subtle rounded-md bg-surface-container-lowest text-text-main cursor-pointer text-xs font-semibold font-body transition-all duration-150 hover:border-primary hover:text-primary" onClick={() => api.openDbFolder()}>Open Folder</button>
        </div>
      </section>

      <section>
        <h3 className="mt-7 mb-4 text-xs font-medium text-text-muted uppercase tracking-wider">Appearance</h3>
        <div className="flex items-center justify-between px-4 py-3.5 rounded-lg text-sm font-medium transition-colors duration-150 hover:bg-surface-soft mt-1">
          <span>Theme</span>
          <div className="flex gap-1 bg-surface-soft rounded-md p-0.75">
            {THEME_OPTIONS.map((opt) => (
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
      </section>

      <section>
        <h3 className="mt-7 mb-4 text-xs font-medium text-text-muted uppercase tracking-wider">Window</h3>
        <label className="flex items-center justify-between px-4 py-3.5 rounded-lg text-sm font-medium transition-colors duration-150 hover:bg-surface-soft mt-1">
          <span>Enable tray</span>
          <input
            className="size-5 cursor-pointer accent-primary"
            type="checkbox"
            checked={config.tray_enabled}
            onChange={() => toggle("tray_enabled")}
          />
        </label>
        <label className="flex items-center justify-between px-4 py-3.5 rounded-lg text-sm font-medium transition-colors duration-150 hover:bg-surface-soft mt-1">
          <span>Auto-start on boot</span>
          <input
            className="size-5 cursor-pointer accent-primary"
            type="checkbox"
            checked={config.autostart_enabled}
            onChange={() => toggle("autostart_enabled")}
          />
        </label>
        <label className="flex items-center justify-between px-4 py-3.5 rounded-lg text-sm font-medium transition-colors duration-150 hover:bg-surface-soft mt-1">
          <span>Enable global hotkey (Ctrl+Shift+E)</span>
          <input
            className="size-5 cursor-pointer accent-primary"
            type="checkbox"
            checked={config.hotkey_enabled}
            onChange={() => toggle("hotkey_enabled")}
          />
        </label>
      </section>

      <section>
        <h3 className="mt-7 mb-4 text-xs font-medium text-text-muted uppercase tracking-wider">About</h3>
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

      <button className="mt-8 px-8 py-3 border-none rounded-xl bg-primary text-on-primary cursor-pointer text-sm font-bold tracking-[0.02em] font-body shadow-btn transition-all duration-200 hover:bg-primary-hover hover:shadow-[0_12px_28px_rgba(93,57,223,0.35)] hover:-translate-y-0.5" onClick={handleSave}>
        Save Settings
      </button>
    </div>
  );
}
