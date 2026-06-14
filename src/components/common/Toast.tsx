import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from "react";
import { ClipboardCheck } from "lucide-react";

interface ToastItem {
  id: number;
  message: string;
}

interface ToastContextValue {
  toast: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const toast = useCallback((message: string) => {
    const id = nextId.current++;
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2000);
  }, []);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container — fixed at bottom-center */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-9999 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-high text-on-surface text-sm font-medium shadow-lg border border-border-subtle animate-toast-in"
            role="status"
          >
            <ClipboardCheck size={16} className="text-green-500 shrink-0" />
            <span>{t.message}</span>
            <button
              className="ml-2 inline-flex items-center justify-center size-5 rounded-full bg-on-surface/10 hover:bg-on-surface/20 cursor-pointer border-none transition-colors shrink-0"
              onClick={() => removeToast(t.id)}
            >
              <span className="text-xs leading-none">✕</span>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
