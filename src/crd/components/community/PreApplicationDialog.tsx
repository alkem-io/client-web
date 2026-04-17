import { Trans, useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/crd/primitives/dialog';

export type PreApplicationDialogVariant = 'dialog-parent-app-pending' | 'dialog-apply-parent';

const PENDING_STATES = new Set(['new', 'archived']);
const isApplicationPending = (state?: string): boolean => !!state && PENDING_STATES.has(state);

type PreApplicationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dialogVariant: PreApplicationDialogVariant;
  parentCommunitySpaceLevel?: 'L0' | 'L1' | 'L2';
  parentCommunityName?: string;
  subspaceName?: string;
  parentApplicationState?: string;
  applyUrl?: string;
  parentApplyUrl?: string;
  className?: string;
};

export function PreApplicationDialog({
  open,
  onOpenChange,
  dialogVariant,
  parentCommunitySpaceLevel,
  parentCommunityName,
  subspaceName,
  parentApplicationState,
  applyUrl,
  parentApplyUrl,
  className,
}: PreApplicationDialogProps) {
  const { t } = useTranslation();

  const pending = isApplicationPending(parentApplicationState);
  const ctaHref = pending ? applyUrl : parentApplyUrl;
  const ctaLabel = pending
    ? t('buttons.apply')
    : t(`components.application-button.${parentCommunitySpaceLevel === 'L0' ? 'goToSpace' : 'goToSubspace'}` as const);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('sm:max-w-md', className)}>
        <DialogTitle>
          <Trans
            i18nKey={`components.application-button.${dialogVariant}.title` as const}
            values={{ parentCommunityName }}
            components={{ strong: <strong /> }}
          />
        </DialogTitle>
        <DialogDescription asChild={true}>
          <div>
            <Trans
              i18nKey={`components.application-button.${dialogVariant}.body` as const}
              values={{ spaceName: parentCommunityName, subspaceName }}
              components={{ strong: <strong /> }}
            />
          </div>
        </DialogDescription>
        <DialogFooter>
          {ctaHref ? (
            <a
              href={ctaHref}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-control font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={ctaLabel}
              onClick={() => onOpenChange(false)}
            >
              {ctaLabel}
            </a>
          ) : (
            <Button type="button" variant="default" disabled={true} aria-disabled={true}>
              {ctaLabel}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
