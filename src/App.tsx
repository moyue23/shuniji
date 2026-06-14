import { useEffect, useState, useCallback } from "react";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { Pencil, Plus, Search } from "lucide-react";
import { useApp } from "./context/AppContext";
import * as api from "./utils/tauri";
import Sidebar from "./components/Layout/Sidebar";
import StickerGrid from "./components/StickerGrid/StickerGrid";
import SettingsPage from "./pages/SettingsPage";
import "./App.css";

function App() {
  const { state, dispatch, loadGroups, loadStickers } = useApp();
  const [search, setSearch] = useState("");

  useEffect(() => {
    const init = async () => {
      await api.initApp();
      await loadGroups();
      await loadStickers(0);
    };
    init();

    const p = getCurrentWebviewWindow().onDragDropEvent(async (event) => {
      if (event.payload.type === "drop") {
        for (const path of event.payload.paths) {
          const ext = path.split(".").pop()?.toLowerCase();
          if (["png", "jpg", "jpeg", "bmp", "gif"].includes(ext || "")) {
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
        await loadStickers(state.currentGroupId || undefined);
        return;
      }
      dispatch({ type: "SET_LOADING", payload: true });
      const stickers = await api.searchStickers(
        keyword,
        state.currentGroupId === 0 ? undefined : state.currentGroupId
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
      const sticker = await api.addSticker(path, name, state.currentGroupId || 0);
      dispatch({ type: "ADD_STICKER", payload: sticker });
    }
  };

  return (
    <div className="app">
      <Sidebar />
      <main className="main">
        <header className="header">
          <div className="header-left">
            <button className="header-btn" onClick={handleAddSticker}>
              <Plus size={18} /> Sticker
            </button>
          </div>
          <div className="header-center">
            <span className="search-icon">
              <Search size={20} />
            </span>
            <input
              className="search-input"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search stickers..."
            />
          </div>
          <div className="header-right">
            <button
              className={`header-btn edit-btn ${state.editMode ? "active" : ""}`}
              onClick={() => dispatch({ type: "TOGGLE_EDIT_MODE" })}
            >
              <Pencil size={16} /> Edit
            </button>
          </div>
        </header>
        {state.currentGroupId === -1 ? (
          <SettingsPage />
        ) : (
          <div className="content">
            {state.editMode && (
              <div className="edit-banner">Edit Mode — drag stickers to reorder or delete</div>
            )}
            <StickerGrid />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
