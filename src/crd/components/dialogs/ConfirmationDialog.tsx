import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
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

/**
 * ConfirmationDialog — two shapes in one component.
 *
 * 1. Confirm variant (default/destructive) — legacy shape. 2 buttons: Cancel + Confirm.
 *    Existing callers continue to work unchanged.
 *
 * 2. Discard variant — 3-button "Save / Discard & leave / Cancel" shape used by the
 *    CRD Space Settings Layout tab when the admin tries to navigate away with an
 *    unsaved buffer (spec 045 FR-026).
 */

type ConfirmationDialogConfirmProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  variant?: 'default' | 'destructive';
  loading?: boolean;
};

type ConfirmationDialogDiscardProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant: 'discard';
  title: string;
  description: string;
  saveLabel: string;
  discardLabel: string;
  cancelLabel?: string;
  onSave: () => void;
  onDiscard: () => void;
  onCancel?: () => void;
  loading?: boolean;
};

type ConfirmationDialogProps = ConfirmationDialogConfirmProps | ConfirmationDialogDiscardProps;

function isDiscardVariant(props: ConfirmationDialogProps): props is ConfirmationDialogDiscardProps {
  return 'variant' in props && props.variant === 'discard';
}

export function ConfirmationDialog(props: ConfirmationDialogProps) {
  const { t } = useTranslation('crd-space');

  if (isDiscardVariant(props)) {
    const {
      open,
      onOpenChange,
      title,
      description,
      saveLabel,
      discardLabel,
      cancelLabel,
      onSave,
      onDiscard,
      onCancel,
      loading = false,
    } = props;

    const handleCancel = () => {
      onCancel?.();
      onOpenChange(false);
    };

    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        {/* The z-[90] is necessary to ensure the dialog appears above other dialogs (memos, whiteboards) that have z-[60]. */}
        <AlertDialogContent className="z-[90]">
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel} disabled={loading}>
              {cancelLabel ?? t('dialogs.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onDiscard}
              disabled={loading}
              aria-busy={loading}
              className={cn('bg-destructive text-destructive-foreground hover:bg-destructive/90')}
            >
              {discardLabel}
            </AlertDialogAction>
            {/* Save is the safe default action — rendered last and auto-focused so Enter triggers onSave, not onDiscard. */}
            <AlertDialogAction onClick={onSave} disabled={loading} aria-busy={loading} autoFocus={true}>
              {saveLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  const {
    open,
    onOpenChange,
    title,
    description,
    confirmLabel,
    cancelLabel,
    onConfirm,
    onCancel,
    variant = 'default',
    loading = false,
  } = props;

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {/* The z-[90] is necessary to ensure the dialog appears above some other dialogs like memos or whiteboards that have z-[60]. */}
      <AlertDialogContent className="z-[90]">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={loading}>
            {cancelLabel ?? t('dialogs.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            aria-busy={loading}
            className={cn(
              variant === 'destructive' && 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
            )}
          >
            {loading && <Loader2 aria-hidden="true" className="mr-1.5 size-4 animate-spin" />}
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
