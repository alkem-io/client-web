import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/crd/primitives/alert-dialog';
import { Label } from '@/crd/primitives/label';
import { Switch } from '@/crd/primitives/switch';

export type CalloutVisibilityAction = 'publish' | 'unpublish';

type CalloutVisibilityChangeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: CalloutVisibilityAction;
  /** Called with `sendNotification` — only meaningful when `action === 'publish'`. */
  onConfirm: (sendNotification: boolean) => void | Promise<void>;
  loading?: boolean;
};

/**
 * Publish / unpublish confirmation (plan D10 / T067). Renders a notify-members
 * switch (default on) only when publishing. Ports the MUI
 * `CalloutVisibilityChangeDialog` to CRD primitives — title + body + Switch +
 * confirm/cancel — under `.crd-root` so focus trap / overlay sit in the same
 * z-index stack as the feed.
 */
export function CalloutVisibilityChangeDialog({
  open,
  onOpenChange,
  action,
  onConfirm,
  loading = false,
}: CalloutVisibilityChangeDialogProps) {
  const { t } = useTranslation('crd-space');
  const [notify, setNotify] = useState(true);

  // Reset the switch when the dialog reopens so a prior "off" choice doesn't leak.
  useEffect(() => {
    if (open) setNotify(true);
  }, [open]);

  const isPublish = action === 'publish';
  const title = isPublish ? t('visibilityChange.publishTitle') : t('visibilityChange.unpublishTitle');
  const description = isPublish ? t('visibilityChange.publishDescription') : t('visibilityChange.unpublishDescription');
  const confirmLabel = isPublish ? t('visibilityChange.publishConfirm') : t('visibilityChange.unpublishConfirm');

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="z-[90]">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        {isPublish && (
          <div className="flex items-center justify-between py-2">
            <Label htmlFor="callout-visibility-notify" className="text-body text-foreground">
              {t('visibilityChange.notifyMembers')}
            </Label>
            <Switch
              id="callout-visibility-notify"
              checked={notify}
              onCheckedChange={setNotify}
              disabled={loading}
              aria-label={t('visibilityChange.notifyMembers')}
            />
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>{t('dialogs.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onConfirm(isPublish ? notify : false)}
            disabled={loading}
            aria-busy={loading}
          >
            {loading && <Loader2 aria-hidden="true" className="mr-1.5 size-4 animate-spin" />}
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
