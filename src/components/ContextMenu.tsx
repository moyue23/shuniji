import { useEffect, useRef } from "react";

export interface ContextMenuItem {
  label: string;
  danger?: boolean;
  action: () => void;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export default function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    // Delay to avoid the same right-click that opened the menu from closing it
    setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
      document.addEventListener("contextmenu", handleClickOutside);
    }, 0);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("contextmenu", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  // Keep menu within viewport
  const style: React.CSSProperties = {
    position: "fixed",
    left: `${x}px`,
    top: `${y}px`,
    zIndex: 1000,
  };

  return (
    <div className="bg-surface-container-lowest border border-border-subtle rounded-lg shadow-[0_4px_24px_rgba(0,0,0,0.12)] p-1.5 min-w-35 flex flex-col gap-0.5" ref={menuRef} style={style}>
      {items.map((item, i) => (
        <button
          key={i}
          className={`block w-full px-3.5 py-2 border-none rounded-sm bg-transparent text-[13px] font-medium font-body cursor-pointer text-left transition-colors duration-100 hover:bg-surface-soft ${item.danger ? "text-error hover:bg-error-container" : "text-text-main"}`}
          onClick={() => {
            item.action();
            onClose();
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
