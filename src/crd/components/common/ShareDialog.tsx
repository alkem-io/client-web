import { ArrowLeft, Check, Copy, Share2 } from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/crd/primitives/dialog';
import { Input } from '@/crd/primitives/input';

const COPIED_FEEDBACK_MS = 2000;

function toAbsoluteUrl(url: string): string {
  try {
    return new URL(url).toString();
  } catch {
    return `${window.location.protocol}//${window.location.host}${url}`;
  }
}

export type ShareDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string | undefined;
  title?: ReactNode;
  /**
   * When provided, renders a "Share on Alkemio" button that switches the dialog
   * body to this slot. The dialog manages a Back button to return to the URL view.
   * When omitted, the Share-on-Alkemio button is hidden.
   */
  shareOnAlkemioSlot?: ReactNode;
  children?: ReactNode;
  className?: string;
};

export function ShareDialog({
  open,
  onOpenChange,
  url,
  title,
  shareOnAlkemioSlot,
  children,
  className,
}: ShareDialogProps) {
  const { t } = useTranslation('crd-common');
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState<'default' | 'alkemio'>('default');

  // Reset view on open/close so the dialog always reopens to the URL view.
  useEffect(() => {
    if (!open) {
      setView('default');
      setCopied(false);
    }
  }, [open]);

  if (!url) return null;

  const fullUrl = toAbsoluteUrl(url);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
    } catch {
      // Clipboard API not available or denied — fail silently, user can select the input manually.
    }
  };

  const isAlkemioView = view === 'alkemio' && shareOnAlkemioSlot;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* z-[70] keeps the share dialog above whiteboard / memo editors (z-[60]) and below confirms (z-[90]). */}
      <DialogContent className={cn('sm:max-w-md z-[70]', className)} overlayClassName="z-[70]" closeLabel={t('close')}>
        <DialogHeader>
          <div className="flex items-center gap-2">
            {isAlkemioView && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setView('default')}
                aria-label={t('share.back')}
                className="size-7 -ml-1"
              >
                <ArrowLeft className="size-4" aria-hidden="true" />
              </Button>
            )}
            <DialogTitle>{title ?? t('share.title')}</DialogTitle>
          </div>
        </DialogHeader>

        {isAlkemioView ? (
          <div>{shareOnAlkemioSlot}</div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Input
                value={fullUrl}
                readOnly={true}
                aria-label={t('share.url')}
                className="flex-1 font-mono text-caption"
                onFocus={e => e.target.select()}
                onClick={e => (e.target as HTMLInputElement).select()}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="shrink-0"
                aria-label={copied ? t('share.copied') : t('share.copy')}
              >
                {copied ? (
                  <Check className="size-4 mr-1" aria-hidden="true" />
                ) : (
                  <Copy className="size-4 mr-1" aria-hidden="true" />
                )}
                {copied ? t('share.copied') : t('share.copy')}
              </Button>
            </div>

            {shareOnAlkemioSlot && (
              <Button type="button" variant="outline" onClick={() => setView('alkemio')} className="w-full">
                <Share2 className="size-4 mr-2" aria-hidden="true" />
                {t('share.shareOnAlkemio')}
              </Button>
            )}

            {children && <div className="pt-2 border-t border-border">{children}</div>}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
