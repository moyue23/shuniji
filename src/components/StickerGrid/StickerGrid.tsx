import { useCallback } from "react";
import { useApp } from "../../context/AppContext";
import * as api from "../../utils/tauri";
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

  const handleDeleteDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const stickerId = e.dataTransfer.getData("text/plain");
    if (!stickerId) return;
    if (!confirm("Delete this sticker?")) return;
    await api.deleteSticker(Number(stickerId));
    dispatch({ type: "REMOVE_STICKER", payload: Number(stickerId) });
  };

  return (
    <div className="sticker-grid-wrap" onDragOver={handleDragOver}>
      {state.loading && <div className="loading">Loading...</div>}
      {!state.loading && state.stickers.length === 0 && (
        <div className="empty">No stickers yet. Drag images here or use "+ Sticker".</div>
      )}
      <div className="sticker-grid">
        {state.stickers.map((sticker) => (
          <StickerItem key={sticker.id} sticker={sticker} onReorder={handleReorder} />
        ))}
      </div>
      {state.editMode && (
        <div
          className="delete-zone"
          onDrop={handleDeleteDrop}
          onDragOver={handleDragOver}
        >
          🗑️ Drag here to delete
        </div>
      )}
    </div>
  );
}
