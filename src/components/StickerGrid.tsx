import { useCallback } from "react";
import { useApp } from "../context/AppContext";
import * as api from "../utils/tauri";
import StickerItem from "./StickerItem";

export default function StickerGrid() {
  const { state, dispatch } = useApp();

  const handleReorder = useCallback(
    async (draggedId: number, targetId: number) => {
      const dragged = state.stickers.find((s) => s.id === draggedId);
      const target = state.stickers.find((s) => s.id === targetId);
      if (!dragged || !target) return;

      const draggedOrder = dragged.sort_order;
      const targetOrder = target.sort_order;
      await api.updateStickerSortOrder(draggedId, targetOrder);
      await api.updateStickerSortOrder(targetId, draggedOrder);

      dispatch({
        type: "SET_STICKERS",
        payload: state.stickers
          .map((s) => {
            if (s.id === draggedId) return { ...s, sort_order: targetOrder };
            if (s.id === targetId) return { ...s, sort_order: draggedOrder };
            return s;
          })
          .sort((a, b) => a.sort_order - b.sort_order),
      });
    },
    [state.stickers, dispatch]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-full" onDragOver={handleDragOver}>
      {state.loading && <div className="text-center px-10 py-20 text-text-muted text-base font-medium">Loading...</div>}
      {!state.loading && state.stickers.length === 0 && (
        <div className="text-center px-10 py-20 text-text-muted text-base font-medium">No stickers yet. Drag images here or use "+ Sticker".</div>
      )}
      <div className="sticker-grid gap-6">
        {state.stickers.map((sticker) => (
          <StickerItem key={sticker.id} sticker={sticker} onReorder={handleReorder} />
        ))}
      </div>
    </div>
  );
}
