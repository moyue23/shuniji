import { useState, useRef, useEffect } from "react";

interface InlineEditProps {
  value: string;
  onSave: (newValue: string) => void;
  className?: string;
  inputClassName?: string;
  /** External control: when flipped to true, enters edit mode */
  trigger?: number;
  /** Allow clicking to enter edit mode. Default true. */
  clickToEdit?: boolean;
}

export default function InlineEdit({ value, onSave, className, inputClassName, trigger, clickToEdit = true }: InlineEditProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  // External trigger support (e.g. context menu "Rename")
  useEffect(() => {
    if (trigger != null && trigger > 0) {
      setDraft(value);
      setEditing(true);
    }
  }, [trigger]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.select();
    }
  }, [editing]);

  const commit = () => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) {
      onSave(trimmed);
    } else {
      setDraft(value);
    }
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        className={inputClassName}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") {
            setDraft(value);
            setEditing(false);
          }
        }}
        autoFocus
      />
    );
  }

  return (
    <span className={className} onClick={clickToEdit ? () => setEditing(true) : undefined} title={clickToEdit ? "Click to rename" : undefined}>
      {value || "Untitled"}
    </span>
  );
}
