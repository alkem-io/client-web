import React from 'react';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import { Button, DialogActions, DialogContent } from '@mui/material';
import { Caption } from '../../../../core/ui/typography';
import { useTranslation } from 'react-i18next';
import Gutters from '../../../../core/ui/grid/Gutters';
import { LoadingButton } from '@mui/lab';
import useLoadingState from '../../../../domain/shared/utils/useLoadingState';
import { Formik } from 'formik';
import * as yup from 'yup';
import FormikInputField from '../../../../core/ui/forms/FormikInputField/FormikInputField';
import { displayNameValidator } from '../../../../core/ui/forms/validator';

type NameVirtualContributorStep2Props = {
  onClose: () => void;
  onBack: () => void;
  onCreateVirtualContributor: (virtualContributorName: string) => Promise<void>;
};

const NameVirtualContributorStep2 = ({
  onClose,
  onBack,
  onCreateVirtualContributor,
}: NameVirtualContributorStep2Props) => {
  const { t } = useTranslation();

  const [handleContinue, loadingCreateVC] = useLoadingState(async (virtualContributorName: string) => {
    await onCreateVirtualContributor(virtualContributorName);
  });

  const initialValues = {
    virtualContributorName: '',
  };

  const validationSchema = yup.object().shape({
    virtualContributorName: displayNameValidator,
  });

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize
      validateOnMount
      onSubmit={() => {}}
    >
      {({ values, isValid }) => (
        <>
          <DialogHeader onClose={onClose}>{t('createVirtualContributorWizard.step2.title')}</DialogHeader>
          <DialogContent>
            <Gutters disablePadding>
              <Caption>{t('createVirtualContributorWizard.step2.description')}</Caption>
              <FormikInputField
                name="virtualContributorName"
                title={t('createVirtualContributorWizard.step2.virtualContributorName')}
                required
              />
            </Gutters>
          </DialogContent>
          <DialogActions>
            <Button variant="text" onClick={onBack}>
              {t('buttons.back')}
            </Button>
            <LoadingButton
              variant="contained"
              disabled={!isValid}
              loading={loadingCreateVC}
              onClick={() => handleContinue(values.virtualContributorName)}
            >
              {t('buttons.continue')}
            </LoadingButton>
          </DialogActions>
        </>
      )}
    </Formik>
  );
};

export default NameVirtualContributorStep2;
