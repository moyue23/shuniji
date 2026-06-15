import { useState, useRef, useCallback } from "react";
import { ImageOff, X } from "lucide-react";
import { useApp } from "../context/AppContext";
import * as api from "../utils/tauri";
import { convertFileSrc } from "@tauri-apps/api/core";
import { useToast } from "./common/Toast";

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
  const { toast } = useToast();
  const [imgError, setImgError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const isGif = sticker.image_path.toLowerCase().endsWith(".gif");
  const imgSrc = convertFileSrc(sticker.image_path);

  const handleCopy = useCallback(async () => {
    try {
      await api.copyStickerToClipboard(sticker.id);
      toast("Copied!");
    } catch (e) {
      console.error("Copy failed:", e);
    }
  }, [sticker.id, toast]);

  const handleDelete = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!await api.confirmDialog("Delete this sticker?", "Delete Sticker")) return;
    await api.deleteSticker(sticker.id);
    dispatch({ type: "REMOVE_STICKER", payload: sticker.id });
  }, [sticker.id, dispatch]);

  const handleClick = () => {
    if (state.editMode) return;
    handleCopy();
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch({ type: "SET_DETAIL_STICKER", payload: sticker.id });
  };

  return (
    <div
      className={`break-inside-avoid mb-6 rounded-xl overflow-hidden bg-surface-soft border border-transparent shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition-all duration-300 relative hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-[rgba(93,57,223,0.2)] ${state.editMode ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"}`}
      onClick={handleClick}
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
      {state.editMode && (
        <button
          className="absolute top-2 right-2 size-6 flex items-center justify-center rounded-full bg-error text-white shadow-md cursor-pointer border-none hover:bg-red-700 transition-colors z-10"
          onClick={handleDelete}
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}
