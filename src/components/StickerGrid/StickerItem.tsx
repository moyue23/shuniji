import { useState, useRef } from "react";
import { ImageOff } from "lucide-react";
import { useApp } from "../../context/AppContext";
import * as api from "../../utils/tauri";
import { convertFileSrc } from "@tauri-apps/api/core";
import ContextMenu, { type ContextMenuItem } from "../ContextMenu";

interface Props {
  sticker: {
    id: number;
    image_path: string;
    tags: string;
    group_id: number;
    sort_order: number;
  };
  onReorder: (draggedId: number, targetId: number) => Promise<void>;
}

export default function StickerItem({ sticker, onReorder }: Props) {
  const { state, dispatch } = useApp();
  const [selected, setSelected] = useState(false);
  const [imgError, setImgError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const [ctxMenu, setCtxMenu] = useState<{
    x: number;
    y: number;
    items: ContextMenuItem[];
  } | null>(null);

  const isGif = sticker.image_path.toLowerCase().endsWith(".gif");
  const imgSrc = convertFileSrc(sticker.image_path);

  const handleCopy = async () => {
    try {
      await api.copyStickerToClipboard(sticker.id);
    } catch (e) {
      console.error("Copy failed:", e);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this sticker?")) return;
    await api.deleteSticker(sticker.id);
    dispatch({ type: "REMOVE_STICKER", payload: sticker.id });
  };

  const handleRename = async () => {
    const name = prompt("Rename sticker:", sticker.tags);
    if (!name || name === sticker.tags) return;
    await api.updateStickerName(sticker.id, name);
    dispatch({
      type: "UPDATE_STICKER",
      payload: { ...sticker, tags: name } as any,
    });
  };

  const handleMove = async (groupId: number) => {
    await api.updateStickerGroup(sticker.id, groupId);
    dispatch({ type: "REMOVE_STICKER", payload: sticker.id });
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const groups = state.groups.filter((g) => g.id !== sticker.group_id);
    const items: ContextMenuItem[] = [
      { label: "Rename", action: handleRename },
      { label: "Delete", action: handleDelete, danger: true },
      ...groups.map((g) => ({
        label: `Move to ${g.name}`,
        action: () => handleMove(g.id),
      })),
    ];
    setCtxMenu({ x: e.clientX, y: e.clientY, items });
  };

  return (
    <div
      className={`break-inside-avoid mb-6 rounded-xl overflow-hidden bg-surface-soft border border-transparent shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition-all duration-300 relative hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-[rgba(93,57,223,0.2)] ${selected ? "border-primary shadow-[0_0_0_3px_rgba(93,57,223,0.15)]" : ""} ${state.editMode ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"}`}
      onClick={() => {
        if (state.editMode) return;
        setSelected(true);
        handleCopy();
        setTimeout(() => setSelected(false), 300);
      }}
      onDoubleClick={() => {
        if (state.editMode) handleRename();
      }}
      onContextMenu={handleContextMenu}
      draggable={state.editMode}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", String(sticker.id));
        e.dataTransfer.setData("sticker/path", sticker.image_path);
      }}
      onDragOver={(e) => {
        if (state.editMode) e.preventDefault();
      }}
      onDrop={async (e) => {
        e.preventDefault();
        if (!state.editMode) return;
        const draggedId = e.dataTransfer.getData("text/plain");
        if (!draggedId || Number(draggedId) === sticker.id) return;
        await onReorder(Number(draggedId), sticker.id);
      }}
    >
      {imgError ? (
        <div className="text-5xl opacity-30 flex items-center justify-center w-full min-h-30 bg-primary-fixed-dim text-primary">
          <ImageOff size={48} />
        </div>
      ) : (
        <img
          ref={imgRef}
          src={imgSrc}
          alt={sticker.tags}
          className="w-full h-auto block object-contain"
          onError={() => setImgError(true)}
        />
      )}
      {isGif && (
        <div className="px-3 py-2 text-xs font-medium text-text-secondary truncate text-center">GIF</div>
      )}
      {state.editMode && !isGif && (
        <div className="px-3 py-2 text-xs font-medium text-text-secondary truncate text-center">{sticker.tags || "Untitled"}</div>
      )}
      {ctxMenu && (
        <ContextMenu
          x={ctxMenu.x}
          y={ctxMenu.y}
          items={ctxMenu.items}
          onClose={() => setCtxMenu(null)}
        />
      )}
    </div>
  );
}
