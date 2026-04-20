import { Check, Copy, Share2 } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/crd/primitives/dialog';
import { Input } from '@/crd/primitives/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/crd/primitives/tooltip';

type ShareButtonProps = {
  url: string | undefined;
  disabled?: boolean;
  tooltip?: string;
  tooltipIfDisabled?: string;
  title?: ReactNode;
  showShareOnAlkemio?: boolean;
  onShareOnAlkemio?: () => void;
  children?: ReactNode;
  className?: string;
};

const COPIED_FEEDBACK_MS = 2000;

function toAbsoluteUrl(url: string): string {
  try {
    return new URL(url).toString();
  } catch {
    return `${window.location.protocol}//${window.location.host}${url}`;
  }
}

export function ShareButton({
  url,
  disabled = false,
  tooltip,
  tooltipIfDisabled,
  title,
  showShareOnAlkemio = true,
  onShareOnAlkemio,
  children,
  className,
}: ShareButtonProps) {
  const { t } = useTranslation('crd-common');
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!url) return null;

  const fullUrl = toAbsoluteUrl(url);
  const tooltipText = disabled ? tooltipIfDisabled : tooltip;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
    } catch {
      // Clipboard API not available or denied — fail silently, user can select the input manually.
    }
  };

  const handleShareOnAlkemio = () => {
    onShareOnAlkemio?.();
    setOpen(false);
  };

  const triggerButton = (
    <Button
      variant="ghost"
      size="icon"
      disabled={disabled}
      onClick={() => setOpen(true)}
      aria-label={t('share.button')}
      aria-haspopup="dialog"
      className={cn('size-8', className)}
    >
      <Share2 className="size-4" aria-hidden="true" />
    </Button>
  );

  return (
    <>
      {tooltipText ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild={true}>{triggerButton}</TooltipTrigger>
            <TooltipContent>{tooltipText}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        triggerButton
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md" closeLabel={t('close')}>
          <DialogHeader>
            <DialogTitle>{title ?? t('share.title')}</DialogTitle>
          </DialogHeader>

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

            {showShareOnAlkemio && onShareOnAlkemio && (
              <Button type="button" variant="outline" onClick={handleShareOnAlkemio} className="w-full">
                <Share2 className="size-4 mr-2" aria-hidden="true" />
                {t('share.shareOnAlkemio')}
              </Button>
            )}

            {children && <div className="pt-2 border-t border-border">{children}</div>}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
