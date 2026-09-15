import { Check, Copy } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/crd/primitives/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/crd/primitives/dialog';
import { Input } from '@/crd/primitives/input';
import { Label } from '@/crd/primitives/label';
import type { McpApiKeyRevealData } from './McpApiKeys.types';

const NS = 'crd-contributorSettings';
const COPIED_FEEDBACK_MS = 2000;

/** MCP endpoint path (contract `connection-recipe`) — matches McpServerController's @Controller('/rest/mcp'). */
const MCP_ENDPOINT_PATH = '/rest/mcp';

export type McpApiKeyRevealPanelProps = {
  open: boolean;
  /** The just-minted plaintext + metadata. Rendered from props only — never fetched, never stored beyond this render. */
  data: McpApiKeyRevealData | undefined;
  /**
   * Runtime-resolved platform base address (production/acceptance/local URL,
   * varying per environment) — MUST come from runtime configuration, never a
   * literal in this component (contract `connection-recipe`, A-14).
   */
  baseAddress: string;
  onClose: () => void;
  /** Fired once the value has been copied — the container uses this to decide the interrupted-reveal edge case. */
  onCopied?: () => void;
};

/**
 * One-time reveal of a freshly minted MCP API key (US1, FR-025, FR-026,
 * FR-027, FR-034). Shows the plaintext exactly once with a will-not-be-
 * shown-again warning, a copy control with an announced result, and the
 * connection recipe built from the runtime base address + the contract path.
 * Purely presentational: the plaintext lives only in `data`, supplied by the
 * container's memory-only state — this component never caches it beyond the
 * current render, and closing/unmounting leaves nothing behind here.
 */
export function McpApiKeyRevealPanel({ open, data, baseAddress, onClose, onCopied }: McpApiKeyRevealPanelProps) {
  const { t } = useTranslation(NS);
  const [copied, setCopied] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCopyTimeout = () => {
    if (copyTimeoutRef.current !== null) {
      clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    if (!open) {
      setCopied(false);
      setAnnouncement('');
      clearCopyTimeout();
    }
  }, [open]);

  // Clear any pending copy-feedback timer on unmount.
  useEffect(() => clearCopyTimeout, []);

  if (!data) return null;

  const clipboardAvailable = typeof navigator !== 'undefined' && Boolean(navigator.clipboard);
  const endpoint = `${baseAddress}${MCP_ENDPOINT_PATH}`;
  const headerValue = `Authorization: Bearer ${data.apiKey}`;

  const handleCopy = async () => {
    if (!clipboardAvailable) return;
    try {
      await navigator.clipboard.writeText(data.apiKey);
      setCopied(true);
      setAnnouncement(t('user.security.mcpApiKeys.reveal.copyAnnouncement'));
      onCopied?.();
      clearCopyTimeout();
      copyTimeoutRef.current = setTimeout(() => {
        copyTimeoutRef.current = null;
        setCopied(false);
      }, COPIED_FEEDBACK_MS);
    } catch {
      // Clipboard permission denied at runtime — the manual-copy hint (below) already
      // covers this: the value stays selectable in the read-only field.
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent closeLabel={t('user.security.mcpApiKeys.reveal.close')}>
        <DialogHeader>
          <DialogTitle>{t('user.security.mcpApiKeys.reveal.title')}</DialogTitle>
          <DialogDescription asChild={true}>
            <p aria-live="assertive" role="alert">
              {t('user.security.mcpApiKeys.reveal.warning')}
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="mcp-api-key-reveal-value">{t('user.security.mcpApiKeys.reveal.keyLabel')}</Label>
            <div className="flex items-center gap-2">
              <Input
                id="mcp-api-key-reveal-value"
                value={data.apiKey}
                readOnly={true}
                className="flex-1 font-mono text-caption"
                onFocus={e => e.target.select()}
                onClick={e => (e.target as HTMLInputElement).select()}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopy}
                disabled={!clipboardAvailable}
                aria-label={
                  copied ? t('user.security.mcpApiKeys.reveal.copied') : t('user.security.mcpApiKeys.reveal.copy')
                }
              >
                {copied ? (
                  <Check className="mr-1 size-4" aria-hidden="true" />
                ) : (
                  <Copy className="mr-1 size-4" aria-hidden="true" />
                )}
                {copied ? t('user.security.mcpApiKeys.reveal.copied') : t('user.security.mcpApiKeys.reveal.copy')}
              </Button>
            </div>
            {!clipboardAvailable ? (
              <p className="text-caption text-muted-foreground">
                {t('user.security.mcpApiKeys.reveal.manualCopyHint')}
              </p>
            ) : null}
            <output aria-live="polite" className="sr-only">
              {announcement}
            </output>
          </div>

          <div className="flex flex-col gap-1.5 rounded-md border bg-muted/30 p-3">
            <p className="text-body-emphasis">{t('user.security.mcpApiKeys.reveal.recipeTitle')}</p>
            <p className="break-all font-mono text-caption">
              <span className="text-muted-foreground">
                {t('user.security.mcpApiKeys.reveal.recipeEndpointLabel')}:{' '}
              </span>
              {endpoint}
            </p>
            <p className="break-all font-mono text-caption">
              <span className="text-muted-foreground">{t('user.security.mcpApiKeys.reveal.recipeHeaderLabel')}: </span>
              {headerValue}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" onClick={onClose}>
            {t('user.security.mcpApiKeys.reveal.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
