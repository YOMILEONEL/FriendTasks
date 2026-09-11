"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useT } from "@/components/i18n/locale-provider";

export function InviteLink({ token, basePath = "groups" }: { token: string; basePath?: "groups" | "lists" }) {
  const [copied, setCopied] = useState(false);
  const t = useT();
  // Lazy initializer so this only reads window.location once, on the client
  // (server render gets ""); reflects the actual host without an env var.
  const [url] = useState(() =>
    typeof window !== "undefined" ? `${window.location.origin}/${basePath}/join/${token}` : ""
  );

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — the input is
      // still there for the user to select and copy manually.
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Input
        value={url}
        readOnly
        onFocus={(e) => e.target.select()}
        className="min-w-0 flex-1"
      />
      <Button variant="secondary" type="button" onClick={handleCopy} className="shrink-0">
        {copied ? t("common.copied") : t("common.copy")}
      </Button>
    </div>
  );
}
