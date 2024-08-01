import React from 'react';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import { Button, DialogActions, DialogContent } from '@mui/material';
import { Caption } from '../../../../core/ui/typography';
import { useTranslation } from 'react-i18next';
import Gutters from '../../../../core/ui/grid/Gutters';
import { LoadingButton } from '@mui/lab';

type AddContentProps = {
  onClose: () => void;
  onCreateBoK: (subspaceId: string) => Promise<void>;
};

const AddContent = ({ onClose }: AddContentProps) => {
  const { t } = useTranslation();

  return (
    <>
      <DialogHeader onClose={onClose}>{t('createVirtualContributorWizard.addContent.title')}</DialogHeader>
      <DialogContent>
        <Gutters disablePadding disableGap>
          <Caption>{t('createVirtualContributorWizard.addContent.description')}</Caption>
          <Caption fontWeight="bold">{t('createVirtualContributorWizard.addContent.descriptionBold')}</Caption>
        </Gutters>
      </DialogContent>
      <DialogActions>
        <Button variant="text" onClick={onClose}>
          {t('buttons.cancel')}
        </Button>
        <LoadingButton
          variant="contained"
          // disabled={!isValid}
          // onClick={() => handleContinue(values.subspaceName)}
        >
          {t('buttons.continue')}
        </LoadingButton>
      </DialogActions>
    </>
  );
};

export default AddContent;
