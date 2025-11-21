import TranslationKey from '@/core/i18n/utils/TranslationKey';
import { Button, DialogContent } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Actions } from '@/core/ui/actions/Actions';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { gutters } from '@/core/ui/grid/utils';
import { BlockTitle } from '@/core/ui/typography';

export interface ConfirmationDialogProps {
  entities: {
    titleId?: TranslationKey;
    title?: string | ReactNode;
    contentId?: TranslationKey;
    content?: ReactNode;
    confirmButtonTextId?: TranslationKey;
    confirmButtonText?: string;
    cancelButtonTextId?: TranslationKey;
    cancelButtonText?: string;
  };
  actions: {
    onCancel: () => void;
    onConfirm?: () => void;
  };
  options: {
    show: boolean;
  };
  state?: {
    isLoading: boolean;
  };
}

const ConfirmationDialog = ({ entities, actions, options, state }: ConfirmationDialogProps) => {
  const { t } = useTranslation();

  const title = entities.titleId ? t(entities.titleId) : entities.title;
  if (!title) {
    throw new Error('The confirmation dialog needs a title provided');
  }
  const content = entities.contentId ? t(entities.contentId) : entities.content;
  if (!content) {
    throw new Error('The confirmation dialog needs text content provided');
  }
  const cancelButtonText = entities.cancelButtonTextId
    ? (t(entities.cancelButtonTextId) as string)
    : entities.cancelButtonText;
  const confirmButtonText = entities.confirmButtonTextId
    ? (t(entities.confirmButtonTextId) as string)
    : entities.confirmButtonText;

  return (
    <Dialog open={options.show} aria-labelledby="confirmation-dialog" onClose={actions.onCancel}>
      <DialogHeader onClose={actions.onCancel}>
        <BlockTitle>
          <>{title}</>
        </BlockTitle>
      </DialogHeader>
      <DialogContent>
        <>{content}</>
      </DialogContent>
      <Actions padding={gutters()} sx={{ justifyContent: 'end' }}>
        <Button variant="text" onClick={actions.onCancel}>
          {cancelButtonText || t('buttons.cancel')}
        </Button>
        {Boolean(actions.onConfirm) && (
          <Button
            variant="contained"
            loading={state?.isLoading}
            disabled={state?.isLoading}
            onClick={actions.onConfirm}
          >
            {confirmButtonText}
          </Button>
        )}
      </Actions>
    </Dialog>
  );
};

export default ConfirmationDialog;
