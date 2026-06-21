import { useState } from "react";
import { Folder, Images, Plus, Settings } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useT } from "../i18n";
import * as api from "../utils/tauri";
import ContextMenu, { type ContextMenuItem } from "./ContextMenu";
import InlineEdit from "./InlineEdit";
import NewGroupDialog from "./NewGroupDialog";

export default function Sidebar() {
  const { state, dispatch, loadStickers } = useApp();
  const { t } = useT();
  const [showNewGroup, setShowNewGroup] = useState(false);

  const handleCreateGroup = async (name: string, folderPath: string | null) => {
    try {
      const group = await api.addGroup(name);
      dispatch({ type: "ADD_GROUP", payload: group });
      setShowNewGroup(false);

      // If folder selected, import stickers into the new group
      if (folderPath) {
        const stickers = await api.importFolder(folderPath, group.id);
        for (const s of stickers) {
          dispatch({ type: "ADD_STICKER", payload: s });
        }
      }

      // Switch to the new group
      dispatch({ type: "SET_CURRENT_GROUP", payload: group.id });
      await loadStickers(group.id);
    } catch (e) {
      await api.alertDialog(t("sidebar.errorCreateGroup"), t("common.error"));
    }
  };

  const handleDeleteGroup = async (id: number) => {
    if (!await api.confirmDialog(t("sidebar.confirmDeleteGroup"), t("sidebar.confirmDeleteGroupTitle"))) return;
    await api.deleteGroup(id);
    dispatch({ type: "REMOVE_GROUP", payload: id });
    if (state.currentGroupId === id) {
      dispatch({ type: "SET_CURRENT_GROUP", payload: null });
      await loadStickers();
    }
  };

  const [dragOverId, setDragOverId] = useState<number | null>(null);

  // Context menu state
  const [ctxMenu, setCtxMenu] = useState<{
    x: number;
    y: number;
    items: ContextMenuItem[];
  } | null>(null);

  // Inline rename state for groups
  const [renamingId, setRenamingId] = useState<number | null>(null);

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

  const handleRenameGroup = async (id: number, name: string) => {
    await api.updateGroupName(id, name);
    dispatch({
      type: "UPDATE_GROUP",
      payload: { id, name, icon_path: "" },
    });
    setRenamingId(null);
  };

  return (
    <aside className="w-(--sidebar-width) bg-surface-soft border-r border-border-subtle flex flex-col h-full shrink-0">

      {/* Top Nav */}
      <nav className="sidebar-nav flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {/* All */}
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer text-sm font-bold transition-all duration-150 select-none ${
            state.currentGroupId === null
              ? "bg-primary-container/10 text-primary"
              : "text-text-muted hover:bg-surface-container hover:text-text-main"
          }`}
          onClick={() => {
            dispatch({ type: "SET_CURRENT_GROUP", payload: null });
            loadStickers();
          }}
        >
          <Images className="w-5 h-5 shrink-0" />
          <span>{t("sidebar.all")}</span>
        </div>

        {/* Groups */}
        {state.groups.map((g) => (
            <div
              key={g.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer text-sm font-bold transition-all duration-150 select-none ${
                state.currentGroupId === g.id
                  ? "bg-primary-container/10 text-primary"
                  : "text-text-muted hover:bg-surface-container hover:text-text-main"
              } ${dragOverId === g.id ? "bg-primary-container outline-2 outline-dashed outline-primary -outline-offset-2" : ""}`}
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
                    { label: t("common.rename"), action: () => setRenamingId(g.id) },
                    { label: t("common.delete"), action: () => handleDeleteGroup(g.id), danger: true },
                  ],
                });
              }}
            >
              <Folder className="w-5 h-5 shrink-0" />
              <InlineEdit
                value={g.name}
                onSave={(name) => handleRenameGroup(g.id, name)}
                trigger={renamingId === g.id ? 1 : 0}
                clickToEdit={false}
                placeholder={t("common.untitled")}
                clickToRenameTitle={t("inlineEdit.clickToRename")}
                className="truncate"
                inputClassName="flex-1 px-1 py-0.5 rounded text-sm font-bold font-body bg-surface-container-lowest border border-primary outline-none min-w-0"
              />
            </div>
          ))}

      </nav>

      {/* Bottom: New Group + Settings */}
      <div className="px-4 py-4 space-y-2 border-t border-border-subtle">
        {/* New Group */}
        <button
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed border-outline-variant text-text-muted hover:border-primary hover:text-primary hover:bg-primary/5 transition-all font-bold text-sm cursor-pointer"
          onClick={() => setShowNewGroup(true)}
        >
          <Plus className="w-5 h-5 shrink-0" />
          <span>{t("sidebar.newGroup")}</span>
        </button>

        {/* Settings */}
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer text-sm font-bold transition-all duration-150 select-none ${
            state.currentGroupId === -1
              ? "bg-primary-container/10 text-primary"
              : "text-text-muted hover:bg-surface-container hover:text-text-main"
          }`}
          onClick={() => dispatch({ type: "SET_CURRENT_GROUP", payload: -1 })}
        >
          <Settings className="w-5 h-5 shrink-0" />
          <span>{t("sidebar.settings")}</span>
        </div>
      </div>

      {showNewGroup && (
        <NewGroupDialog
          onClose={() => setShowNewGroup(false)}
          onCreate={handleCreateGroup}
        />
      )}

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
