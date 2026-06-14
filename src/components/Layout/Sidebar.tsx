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
    <aside className="sidebar">
      <div className="sidebar-top">
        <button className="sidebar-btn" onClick={() => setAdding(!adding)}>
          <Plus size={18} /> Group
        </button>
        {adding && (
          <div className="sidebar-add-group">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Group name"
              onKeyDown={(e) => e.key === "Enter" && handleAddGroup()}
              autoFocus
            />
            <button onClick={handleAddGroup}>OK</button>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        <div
          className={`sidebar-item ${state.currentGroupId === 0 ? "active" : ""} ${dragOverId === 0 ? "drag-over" : ""}`}
          onClick={() => {
            dispatch({ type: "SET_CURRENT_GROUP", payload: 0 });
            loadStickers(0);
          }}
          onDragOver={(e) => handleGroupDragOver(e, 0)}
          onDragLeave={() => setDragOverId(null)}
          onDrop={(e) => handleGroupDrop(e, 0)}
        >
          <span className="sidebar-item-icon"><Images size={16} /></span>
          <span>All</span>
        </div>
        {state.groups
          .filter((g) => g.id !== 0)
          .map((g) => (
            <div
              key={g.id}
              className={`sidebar-item ${state.currentGroupId === g.id ? "active" : ""} ${dragOverId === g.id ? "drag-over" : ""}`}
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
              <span className="sidebar-item-icon"><Folder size={16} /></span>
              <span>{g.name}</span>
            </div>
          ))}
      </nav>

      <div className="sidebar-bottom">
        <div
          className="sidebar-item"
          onClick={() => dispatch({ type: "SET_CURRENT_GROUP", payload: -1 })}
        >
          <span className="sidebar-item-icon"><Settings size={16} /></span>
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
