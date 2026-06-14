import { useState, useRef } from "react";
import { useApp } from "../../context/AppContext";
import * as api from "../../utils/tauri";
import { convertFileSrc } from "@tauri-apps/api/core";

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
  const [hover, setHover] = useState(false);
  const [selected, setSelected] = useState(false);
  const [imgError, setImgError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

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
    const options = ["Rename", "Delete", ...groups.map((g) => `Move: ${g.name}`)];
    const choice = prompt(
      `Sticker: ${sticker.tags || "Untitled"}\n${options
        .map((o, i) => `${i + 1}. ${o}`)
        .join("\n")}\nEnter number:`
    );
    const n = parseInt(choice || "", 10);
    if (n === 1) handleRename();
    if (n === 2) handleDelete();
    if (n >= 3 && n <= 2 + groups.length) {
      handleMove(groups[n - 3].id);
    }
  };

  return (
    <div
      className={`sticker-item ${selected ? "selected" : ""} ${state.editMode ? "edit" : ""}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
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
      <div className="sticker-item-img-wrap">
        {imgError ? (
          <span className="sticker-item-placeholder">🖼</span>
        ) : (
          <>
            <img
              ref={imgRef}
              src={imgSrc}
              alt={sticker.tags}
              className="sticker-item-img"
              style={{ display: hover && isGif ? "none" : "block" }}
              onError={() => setImgError(true)}
            />
            {isGif && hover && (
              <img
                src={imgSrc}
                alt={sticker.tags}
                className="sticker-item-img"
                style={{ display: "block" }}
                onError={() => setImgError(true)}
              />
            )}
          </>
        )}
      </div>
      {state.editMode && (
        <div className="sticker-item-name">{sticker.tags || "Untitled"}</div>
      )}
    </div>
  );
}
