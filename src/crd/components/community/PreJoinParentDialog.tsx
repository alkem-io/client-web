import { Trans, useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/crd/primitives/dialog';

type PreJoinParentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentCommunityName?: string;
  parentCommunitySpaceLevel?: 'L0' | 'L1' | 'L2';
  subspaceName?: string;
  parentApplyUrl?: string;
  className?: string;
};

export function PreJoinParentDialog({
  open,
  onOpenChange,
  parentCommunityName,
  parentCommunitySpaceLevel,
  subspaceName,
  parentApplyUrl,
  className,
}: PreJoinParentDialogProps) {
  const { t } = useTranslation();

  const ctaLabel = t(
    `components.application-button.${parentCommunitySpaceLevel === 'L0' ? 'goToSpace' : 'goToSubspace'}` as const
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('sm:max-w-md', className)}>
        <DialogTitle>
          <Trans
            i18nKey="components.application-button.dialog-join-parent.title"
            values={{ parentCommunityName }}
            components={{ strong: <strong /> }}
          />
        </DialogTitle>
        <DialogDescription asChild={true}>
          <div>
            <Trans
              i18nKey="components.application-button.dialog-join-parent.body"
              values={{ spaceName: parentCommunityName, parentCommunityName, subspaceName }}
              components={{ strong: <strong /> }}
            />
          </div>
        </DialogDescription>
        <DialogFooter>
          {parentApplyUrl ? (
            <a
              href={parentApplyUrl}
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
