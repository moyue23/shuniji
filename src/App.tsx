import { useEffect, useState, useCallback } from "react";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { Pencil, Plus, RefreshCw, Search, X } from "lucide-react";
import { useApp } from "./context/AppContext";
import * as api from "./utils/tauri";
import { initTheme } from "./utils/theme";
import Sidebar from "./components/Sidebar";
import StickerGrid from "./components/StickerGrid";
import SettingsPage from "./pages/SettingsPage";
import StickerDetailPage from "./pages/StickerDetailPage";
import "./App.css";

function App() {
  const { state, dispatch, loadGroups, loadStickers, refreshAll } = useApp();
  const [search, setSearch] = useState("");

  useEffect(() => {
    initTheme();
    const init = async () => {
      await api.initApp();
      await loadGroups();
      await loadStickers();
    };
    init();

    const p = getCurrentWebviewWindow().onDragDropEvent(async (event) => {
      if (event.payload.type === "drop") {
        for (const path of event.payload.paths) {
          const ext = path.split(".").pop()?.toLowerCase();
          if (["png", "jpg", "jpeg", "bmp", "gif", "webp"].includes(ext || "")) {
            const name = path.split(/[\\/]/).pop()?.split(".")[0] || "sticker";
            try {
              const sticker = await api.addSticker(path, name, 0);
              dispatch({ type: "ADD_STICKER", payload: sticker });
            } catch {
              // silently ignore failed imports
            }
          }
        }
      }
    });
    return () => {
      p.then((fn) => fn());
    };
  }, [loadGroups, loadStickers, dispatch]);

  const handleSearch = useCallback(
    async (keyword: string) => {
      setSearch(keyword);
      dispatch({ type: "SET_SEARCH_KEYWORD", payload: keyword });
      if (!keyword.trim()) {
        await loadStickers(state.currentGroupId ?? undefined);
        return;
      }
      dispatch({ type: "SET_LOADING", payload: true });
      const stickers = await api.searchStickers(
        keyword,
        state.currentGroupId ?? undefined
      );
      dispatch({ type: "SET_STICKERS", payload: stickers });
      dispatch({ type: "SET_LOADING", payload: false });
    },
    [state.currentGroupId, loadStickers, dispatch]
  );

  const handleAddSticker = async () => {
    const paths = await api.openImageDialog();
    if (!paths) return;
    for (const path of paths) {
      const name = path.split(/[\\/]/).pop()?.split(".")[0] || "sticker";
      const sticker = await api.addSticker(path, name, state.currentGroupId ?? 0);
      dispatch({ type: "ADD_STICKER", payload: sticker });
    }
  };

  return (
    <div className="flex h-screen w-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden min-w-0 bg-surface-container-lowest">
        {state.currentGroupId !== -1 && state.detailStickerId == null && (
        <header className="h-20 bg-(--header-bg) backdrop-blur-md border-b border-border-subtle flex items-center px-8 gap-6 z-50 shrink-0">
          <div className="flex gap-3 shrink-0">
            <button className="inline-flex items-center gap-2 px-5 py-2.5 border border-border-subtle rounded-xl bg-surface-container-lowest cursor-pointer text-sm font-bold tracking-[0.02em] font-body text-primary whitespace-nowrap shadow-sm transition-all duration-200 hover:border-primary hover:shadow-md" onClick={handleAddSticker}>
              <Plus size={18} /> Sticker
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2.5 border border-border-subtle rounded-xl bg-surface-container-lowest cursor-pointer text-sm font-bold tracking-[0.02em] font-body text-text-main whitespace-nowrap shadow-sm transition-all duration-200 hover:border-primary hover:text-primary hover:shadow-md" onClick={async () => { await api.cleanupInvalidStickers(); await refreshAll(); }}>
              <RefreshCw size={18} />
            </button>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="w-full max-w-2xl relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none flex transition-colors duration-200 group-focus-within:text-primary">
                <Search size={20} />
              </span>
              <input
                className="w-full bg-surface-soft border-none rounded-full py-3 pl-11 pr-4 text-base font-body text-text-main outline-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 placeholder:text-text-muted/70 hover:bg-surface-container-low focus:bg-surface-container-lowest focus:shadow-[0_0_0_3px_rgba(93,57,223,0.12),0_4px_20px_rgba(93,57,223,0.08)]"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search stickers..."
              />
            </div>
          </div>
          <div className="flex gap-3 shrink-0">
            <button
              className={`inline-flex items-center gap-2 px-5 py-2.5 border rounded-xl cursor-pointer text-sm font-bold tracking-[0.02em] font-body whitespace-nowrap transition-all duration-200 ${state.editMode ? "bg-primary text-on-primary border-primary shadow-btn" : "bg-surface-container-lowest text-primary border-border-subtle shadow-sm hover:border-primary hover:shadow-md"}`}
              onClick={() => dispatch({ type: "TOGGLE_EDIT_MODE" })}
            >
              {state.editMode ? <><X size={16} /> Exit</> : <><Pencil size={16} /> Edit</>}
            </button>
          </div>
        </header>
        )}
        {state.detailStickerId != null ? (
          <StickerDetailPage />
        ) : state.currentGroupId === -1 ? (
          <SettingsPage />
        ) : (
          <div className="content flex-1 overflow-y-auto p-8">
            <StickerGrid />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
