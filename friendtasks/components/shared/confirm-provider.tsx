"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useT } from "@/components/i18n/locale-provider";

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  // Red confirm button for destructive actions (delete, remove, leave) —
  // the default (non-destructive) style covers things like "save anyway
  // despite this overlap".
  danger?: boolean;
}

type ConfirmFn = (options: ConfirmOptions | string) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

// A single shared confirmation dialog for the whole app, so every
// destructive action (delete, remove, leave) and every "proceed anyway?"
// prompt gets the same styled modal instead of the native, unstyleable
// browser confirm(). Call sites just swap `confirm(...)` for
// `await confirm(...)` from useConfirm() — same shape, now async.
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);
  const t = useT();

  const confirmFn = useCallback<ConfirmFn>((input) => {
    const normalized = typeof input === "string" ? { message: input } : input;
    setOptions(normalized);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  function settle(result: boolean) {
    setOptions(null);
    resolveRef.current?.(result);
    resolveRef.current = null;
  }

  return (
    <ConfirmContext.Provider value={confirmFn}>
      {children}
      {options && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
          onClick={() => settle(false)}
        >
          <div
            className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl dark:bg-zinc-900"
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
          >
            {options.title && (
              <h2 className="mb-1 font-medium text-zinc-900 dark:text-zinc-50">{options.title}</h2>
            )}
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{options.message}</p>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => settle(false)}>
                {options.cancelLabel ?? t("common.cancel")}
              </Button>
              <Button variant={options.danger ? "danger" : "primary"} onClick={() => settle(true)}>
                {options.confirmLabel ?? t("common.confirmAction")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within a ConfirmProvider");
  return ctx;
}
