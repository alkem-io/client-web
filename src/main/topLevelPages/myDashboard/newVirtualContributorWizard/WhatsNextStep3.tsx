import React from 'react';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import { Button, DialogActions, DialogContent } from '@mui/material';
import { Caption } from '../../../../core/ui/typography';
import { useTranslation } from 'react-i18next';
import RouterLink from '../../../../core/ui/link/RouterLink';

type WhatsNextStep3Props = {
  onClose: () => void;
  updateProfileUrl: string | undefined;
  addKnowledgeUrl: string | undefined;
};

const WhatsNextStep3 = ({ onClose, updateProfileUrl, addKnowledgeUrl }: WhatsNextStep3Props) => {
  const { t } = useTranslation();

  return (
    <>
      <DialogHeader onClose={onClose}>{t('createVirtualContributorWizard.step3.title')}</DialogHeader>
      <DialogContent>
        <Caption>{t('createVirtualContributorWizard.step3.description')}</Caption>
      </DialogContent>
      <DialogActions sx={{ textAlign: 'center' }}>
        {updateProfileUrl && (
          <Button component={RouterLink} variant="contained" to={updateProfileUrl}>
            {t('createVirtualContributorWizard.step3.updateProfile')}
          </Button>
        )}
        {addKnowledgeUrl && (
          <Button component={RouterLink} variant="contained" to={addKnowledgeUrl}>
            {t('createVirtualContributorWizard.step3.addKnowledge')}
          </Button>
        )}
      </DialogActions>
    </>
  );
};

export default WhatsNextStep3;
