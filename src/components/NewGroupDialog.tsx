import { useState } from "react";
import { FolderOpen, Plus } from "lucide-react";

interface Props {
  onClose: () => void;
  onCreate: (name: string, folderPath: string | null) => void;
}

export default function NewGroupDialog({ onClose, onCreate }: Props) {
  const [name, setName] = useState("");
  const [folderPath, setFolderPath] = useState<string | null>(null);

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreate(name.trim(), folderPath);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-surface-container-lowest rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.2)] p-6 w-[380px] max-w-[90vw] border border-border-subtle flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-text-main tracking-[-0.01em]">New Group</h3>

        {/* Group name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Name
          </label>
          <input
            className="px-3 py-2.5 border border-border-subtle rounded-lg text-sm font-body bg-surface-soft outline-none transition-colors duration-200 focus:border-primary focus:shadow-[0_0_0_3px_rgba(93,57,223,0.1)] text-text-main"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Group name"
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            autoFocus
          />
        </div>

        {/* Import folder */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Import Folder <span className="font-normal normal-case tracking-normal text-text-muted/60">(optional)</span>
          </label>
          {folderPath ? (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-surface-soft text-sm text-text-secondary">
              <FolderOpen size={16} className="shrink-0 text-primary" />
              <span className="truncate">{folderPath}</span>
              <button
                className="ml-auto shrink-0 text-xs text-text-muted hover:text-error transition-colors"
                onClick={() => setFolderPath(null)}
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              className="inline-flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-outline-variant rounded-lg text-sm font-medium text-text-muted hover:border-primary hover:text-primary hover:bg-primary/5 transition-all cursor-pointer"
              onClick={async () => {
                const { openFolderDialog } = await import("../utils/tauri");
                const path = await openFolderDialog();
                if (path) setFolderPath(path);
              }}
            >
              <FolderOpen size={16} />
              Choose folder
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-1">
          <button
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-text-secondary hover:text-text-main hover:bg-surface-soft transition-all cursor-pointer"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-on-primary text-sm font-bold shadow-btn transition-all duration-200 hover:bg-primary-hover hover:shadow-[0_8px_24px_rgba(93,57,223,0.35)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            onClick={handleCreate}
            disabled={!name.trim()}
          >
            <Plus size={16} />
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
