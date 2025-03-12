import TranslationKey from '@/core/i18n/utils/TranslationKey';
import { LoadingButton } from '@mui/lab';
import { Button, DialogContent } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Actions } from '../actions/Actions';
import DialogHeader from '../dialog/DialogHeader';
import { gutters } from '../grid/utils';
import { BlockTitle } from '../typography';
/**
 * @deprecated Needs refactor, do not base other components on this Props.
 */
export interface ConfirmationDialogProps {
  entities: {
    titleId?: TranslationKey;
    title?: string | ReactNode;
    contentId?: TranslationKey;
    content?: ReactNode;
    confirmButtonTextId?: TranslationKey;
    confirmButtonText?: string;
  };
  actions: {
    onCancel: () => void;
    onConfirm: () => void;
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
  const confirmButtonText = entities.confirmButtonTextId
    ? (t(entities.confirmButtonTextId) as string)
    : entities.confirmButtonText;
  if (!confirmButtonText) {
    throw new Error('The confirmation dialog needs button text content provided');
  }

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
        <Button variant="contained" onClick={actions.onCancel}>
          {t('buttons.cancel')}
        </Button>
        <LoadingButton
          variant="text"
          loading={state?.isLoading}
          disabled={state?.isLoading}
          onClick={actions.onConfirm}
        >
          {confirmButtonText}
        </LoadingButton>
      </Actions>
    </Dialog>
  );
};

export default ConfirmationDialog;
