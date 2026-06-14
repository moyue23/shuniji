import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import * as api from "../utils/tauri";
import type { AppSettings } from "../types";

export default function SettingsPage() {
  const { state, dispatch } = useApp();
  const [config, setConfig] = useState(state.settings);

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

  if (!config) return <div className="settings">Loading...</div>;

  return (
    <div className="settings">
      <h2>Settings</h2>

      <section>
        <h3>Paths</h3>
        <div className="setting-row">
          <span>Sticker save path</span>
          <button onClick={() => api.openStickerFolder()}>Open Folder</button>
        </div>
        <div className="setting-row">
          <span>Database path</span>
          <button onClick={() => api.openDbFolder()}>Open Folder</button>
        </div>
      </section>

      <section>
        <h3>Window</h3>
        <label className="setting-row">
          <span>Enable tray</span>
          <input
            type="checkbox"
            checked={config.tray_enabled}
            onChange={() => toggle("tray_enabled")}
          />
        </label>
        <label className="setting-row">
          <span>Auto-start on boot</span>
          <input
            type="checkbox"
            checked={config.autostart_enabled}
            onChange={() => toggle("autostart_enabled")}
          />
        </label>
        <label className="setting-row">
          <span>Enable global hotkey (Ctrl+Shift+E)</span>
          <input
            type="checkbox"
            checked={config.hotkey_enabled}
            onChange={() => toggle("hotkey_enabled")}
          />
        </label>
      </section>

      <section>
        <h3>About</h3>
        <div className="setting-row">
          <a
            href="https://github.com/moyue23/shuniji"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </div>
      </section>

      <button className="save-btn" onClick={handleSave}>
        Save Settings
      </button>
    </div>
  );
}
