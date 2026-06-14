import { useState } from "react";
import { Folder, Images, Plus, Settings } from "lucide-react";
import { useApp } from "../../context/AppContext";
import * as api from "../../utils/tauri";
import ContextMenu, { type ContextMenuItem } from "../ContextMenu";

export default function Sidebar() {
  const { state, dispatch, loadStickers } = useApp();
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");

  const handleAddGroup = async () => {
    if (!newName.trim()) return;
    try {
      const group = await api.addGroup(newName.trim());
      dispatch({ type: "ADD_GROUP", payload: group });
      setNewName("");
      setAdding(false);
    } catch (e) {
      alert("Group name already exists or invalid");
    }
  };

  const handleDeleteGroup = async (id: number) => {
    if (!confirm("Delete this group? Stickers will move to 'Ungrouped'.")) return;
    await api.deleteGroup(id);
    dispatch({ type: "REMOVE_GROUP", payload: id });
    if (state.currentGroupId === id) {
      dispatch({ type: "SET_CURRENT_GROUP", payload: 0 });
      await loadStickers(0);
    }
  };

  const [dragOverId, setDragOverId] = useState<number | null>(null);

  // Context menu state
  const [ctxMenu, setCtxMenu] = useState<{
    x: number;
    y: number;
    items: ContextMenuItem[];
  } | null>(null);

  const handleGroupDrop = async (e: React.DragEvent, groupId: number) => {
    e.preventDefault();
    setDragOverId(null);
    const stickerId = e.dataTransfer.getData("text/plain");
    if (!stickerId) return;
    await api.updateStickerGroup(Number(stickerId), groupId);
    dispatch({ type: "REMOVE_STICKER", payload: Number(stickerId) });
  };

  const handleGroupDragOver = (e: React.DragEvent, groupId: number) => {
    if (!state.editMode) return;
    e.preventDefault();
    setDragOverId(groupId);
  };

  const handleRenameGroup = async (id: number, oldName: string) => {
    const name = prompt("Rename group:", oldName);
    if (!name || name === oldName) return;
    await api.updateGroupName(id, name);
    dispatch({
      type: "UPDATE_GROUP",
      payload: { id, name, icon_path: "" },
    });
  };

  return (
    <aside className="w-(--sidebar-width) bg-surface-soft border-r border-border-subtle flex flex-col z-40 shrink-0">
      <div className="px-4 py-6">
        <button className="w-full px-4 py-3 border-none rounded-xl bg-primary text-on-primary cursor-pointer font-body text-sm font-bold tracking-[0.02em] leading-5 shadow-btn transition-all duration-200 inline-flex items-center justify-center gap-2 hover:bg-primary-hover hover:shadow-[0_12px_28px_rgba(93,57,223,0.35)] hover:-translate-y-0.5 active:translate-y-0" onClick={() => setAdding(!adding)}>
          <Plus size={18} /> Group
        </button>
        {adding && (
          <div className="flex gap-2 mt-3">
            <input
              className="flex-1 px-3 py-2 border border-border-subtle rounded-md text-[13px] font-body bg-surface-container-lowest outline-none transition-colors duration-200 focus:border-primary focus:shadow-[0_0_0_3px_rgba(93,57,223,0.1)]"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Group name"
              onKeyDown={(e) => e.key === "Enter" && handleAddGroup()}
              autoFocus
            />
            <button className="px-3.5 py-2 border-none rounded-md bg-primary text-on-primary cursor-pointer text-xs font-semibold font-body transition-colors duration-150 hover:bg-primary-hover" onClick={handleAddGroup}>OK</button>
          </div>
        )}
      </div>

      <nav className="sidebar-nav flex-1 overflow-y-auto px-3 py-2">
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer text-sm font-bold tracking-[0.02em] leading-5 transition-all duration-150 select-none mb-0.5 ${state.currentGroupId === 0 ? "bg-[rgba(93,57,223,0.08)] text-primary" : "text-text-muted hover:bg-surface-container hover:text-text-main"} ${dragOverId === 0 ? "bg-primary-container outline-2 outline-dashed outline-primary -outline-offset-2" : ""}`}
          onClick={() => {
            dispatch({ type: "SET_CURRENT_GROUP", payload: 0 });
            loadStickers(0);
          }}
          onDragOver={(e) => handleGroupDragOver(e, 0)}
          onDragLeave={() => setDragOverId(null)}
          onDrop={(e) => handleGroupDrop(e, 0)}
        >
          <span className="text-xl size-6 flex items-center justify-center shrink-0"><Images size={16} /></span>
          <span>All</span>
        </div>
        {state.groups
          .filter((g) => g.id !== 0)
          .map((g) => (
            <div
              key={g.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer text-sm font-bold tracking-[0.02em] leading-5 transition-all duration-150 select-none mb-0.5 ${state.currentGroupId === g.id ? "bg-[rgba(93,57,223,0.08)] text-primary" : "text-text-muted hover:bg-surface-container hover:text-text-main"} ${dragOverId === g.id ? "bg-primary-container outline-2 outline-dashed outline-primary -outline-offset-2" : ""}`}
              onClick={() => {
                dispatch({ type: "SET_CURRENT_GROUP", payload: g.id });
                loadStickers(g.id);
              }}
              onDragOver={(e) => handleGroupDragOver(e, g.id)}
              onDragLeave={() => setDragOverId(null)}
              onDrop={(e) => handleGroupDrop(e, g.id)}
              onContextMenu={(e) => {
                e.preventDefault();
                setCtxMenu({
                  x: e.clientX,
                  y: e.clientY,
                  items: [
                    { label: "Rename", action: () => handleRenameGroup(g.id, g.name) },
                    { label: "Delete", action: () => handleDeleteGroup(g.id), danger: true },
                  ],
                });
              }}
            >
              <span className="text-xl size-6 flex items-center justify-center shrink-0"><Folder size={16} /></span>
              <span>{g.name}</span>
            </div>
          ))}
      </nav>

      <div className="p-3 border-t border-border-subtle mb-2">
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer text-sm font-bold tracking-[0.02em] leading-5 text-text-muted transition-all duration-150 select-none mb-0.5 hover:bg-surface-container hover:text-text-main"
          onClick={() => dispatch({ type: "SET_CURRENT_GROUP", payload: -1 })}
        >
          <span className="text-xl size-6 flex items-center justify-center shrink-0"><Settings size={16} /></span>
          <span>Settings</span>
        </div>
      </div>

      {ctxMenu && (
        <ContextMenu
          x={ctxMenu.x}
          y={ctxMenu.y}
          items={ctxMenu.items}
          onClose={() => setCtxMenu(null)}
        />
      )}
    </aside>
  );
}
