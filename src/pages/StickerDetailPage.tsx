import { useState, useMemo } from "react";
import { ArrowLeft, Clipboard, Plus, X, ImageOff } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useT } from "../i18n";
import * as api from "../utils/tauri";
import { convertFileSrc } from "@tauri-apps/api/core";
import InlineEdit from "../components/InlineEdit";
import { useToast } from "../components/common/Toast";

const MAX_TAGS = 10;

export default function StickerDetailPage() {
  const { state, dispatch } = useApp();
  const { t } = useT();
  const { toast } = useToast();
  const sticker = state.stickers.find((s) => s.id === state.detailStickerId);
  const [imgError, setImgError] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const tags = useMemo(() => {
    if (!sticker?.tags) return [];
    return sticker.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }, [sticker?.tags]);

  const handleBack = () => {
    dispatch({ type: "SET_DETAIL_STICKER", payload: null });
  };

  const handleCopy = async () => {
    if (!sticker) return;
    try {
      await api.copyStickerToClipboard(sticker.id);
      toast(t("common.copied"));
    } catch (e) {
      console.error("Copy failed:", e);
    }
  };

  const handleRename = async (name: string) => {
    if (!sticker) return;
    await api.updateStickerName(sticker.id, name);
    dispatch({
      type: "UPDATE_STICKER",
      payload: { ...sticker, tags: name },
    });
  };

  const saveTags = async (newTags: string[]) => {
    if (!sticker) return;
    const joined = newTags.join(", ");
    await api.updateStickerName(sticker.id, joined);
    dispatch({
      type: "UPDATE_STICKER",
      payload: { ...sticker, tags: joined },
    });
  };

  const handleAddTag = () => {
    const val = tagInput.trim();
    if (!val || tags.length >= MAX_TAGS) return;
    saveTags([...tags, val]);
    setTagInput("");
  };

  const handleRemoveTag = (idx: number) => {
    saveTags(tags.filter((_, i) => i !== idx));
  };

  if (!sticker) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="text-text-muted">{t("detail.notFound")}</span>
      </div>
    );
  }

  const isGif = sticker.image_path.toLowerCase().endsWith(".gif");
  const imgSrc = convertFileSrc(sticker.image_path);
  const createdDate = new Date(sticker.created_at).toLocaleString();

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border-subtle shrink-0">
        <button
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border-subtle rounded-lg bg-surface-container-lowest cursor-pointer text-sm font-medium text-text-main transition-all duration-200 hover:border-primary hover:text-primary"
          onClick={handleBack}
        >
          <ArrowLeft size={16} /> {t("common.back")}
        </button>
        <span className="flex-1 text-sm text-text-muted truncate">
          {sticker.tags || t("common.untitled")}
        </span>
        <button
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border-subtle rounded-lg bg-surface-container-lowest cursor-pointer text-sm font-medium text-text-main transition-all duration-200 hover:border-primary hover:text-primary"
          onClick={handleCopy}
        >
          <Clipboard size={14} /> {t("common.copy")}
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 flex min-h-0">
        {/* Left: large image */}
        <div className="flex-1 flex items-center justify-center p-8 min-w-0">
          {imgError ? (
            <div className="flex flex-col items-center gap-3 text-text-muted opacity-40">
              <ImageOff size={80} />
              <span className="text-sm">{t("detail.imageError")}</span>
            </div>
          ) : (
            <img
              src={imgSrc}
              alt={sticker.tags}
              className="max-w-full max-h-full object-contain rounded-xl shadow-lg"
              decoding="async"
              draggable={false}
              onError={() => setImgError(true)}
            />
          )}
        </div>

        {/* Right: info panel */}
        <aside className="w-75 border-l border-border-subtle overflow-y-auto p-6 flex flex-col gap-6 shrink-0">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              {t("common.name")}
            </label>
            <InlineEdit
              value={sticker.tags || t("common.untitled")}
              onSave={handleRename}
              placeholder={t("common.untitled")}
              clickToRenameTitle={t("inlineEdit.clickToRename")}
              className="text-sm font-medium text-text-main cursor-pointer transition-colors duration-150 hover:text-primary block"
              inputClassName="text-sm font-medium text-text-main border-b border-primary outline-none w-full font-body"
            />
          </div>

          {/* Created at */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              {t("detail.saved")}
            </label>
            <span className="text-sm text-text-secondary">
              {createdDate}
            </span>
          </div>

          {/* GIF badge */}
          {isGif && (
            <span className="inline-flex self-start px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-container text-primary">
              {t("common.gif")}
            </span>
          )}

          {/* Tags */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              {t("detail.tags")}
              <span className="ml-1 font-normal normal-case tracking-normal text-text-muted/60">
                ({tags.length}/{MAX_TAGS})
              </span>
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary-container text-primary max-w-full"
                >
                  <span className="break-all">{tag}</span>
                  <button
                    className="shrink-0 inline-flex items-center justify-center size-4 rounded-full cursor-pointer hover:bg-primary/20"
                    onClick={() => handleRemoveTag(i)}
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
              {tags.length === 0 && (
                <span className="text-xs text-text-muted italic py-1">
                  {t("detail.noTags")}
                </span>
              )}
            </div>
            {tags.length < MAX_TAGS && (
              <div className="flex gap-2 mt-1">
                <input
                  className="flex-1 px-3 py-1.5 border border-border-subtle rounded-md text-xs font-body bg-surface-container-lowest outline-none transition-colors duration-200 focus:border-primary focus:shadow-[0_0_0_3px_rgba(93,57,223,0.1)]"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder={t("detail.newTagPlaceholder")}
                  onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                />
                <button
                  className="px-3 py-1.5 border-none rounded-md bg-primary text-on-primary cursor-pointer text-xs font-semibold font-body transition-colors duration-150 hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed"
                  onClick={handleAddTag}
                  disabled={!tagInput.trim()}
                >
                  <Plus size={14} />
                </button>
              </div>
            )}
          </div>

        </aside>
      </div>
    </div>
  );
}
