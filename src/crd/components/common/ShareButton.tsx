import { Share2 } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShareDialog } from '@/crd/components/common/ShareDialog';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/crd/primitives/tooltip';

type ShareButtonProps = {
  url: string | undefined;
  disabled?: boolean;
  tooltip?: string;
  tooltipIfDisabled?: string;
  dialogTitle?: ReactNode;
  shareOnAlkemioSlot?: ReactNode;
  children?: ReactNode;
  className?: string;
};

export function ShareButton({
  url,
  disabled = false,
  tooltip,
  tooltipIfDisabled,
  dialogTitle,
  shareOnAlkemioSlot,
  children,
  className,
}: ShareButtonProps) {
  const { t } = useTranslation('crd-common');
  const [open, setOpen] = useState(false);

  if (!url) return null;

  const tooltipText = disabled ? tooltipIfDisabled : tooltip;

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

      <ShareDialog
        open={open}
        onOpenChange={setOpen}
        url={url}
        title={dialogTitle}
        shareOnAlkemioSlot={shareOnAlkemioSlot}
      >
        {children}
      </ShareDialog>
    </>
  );
}
