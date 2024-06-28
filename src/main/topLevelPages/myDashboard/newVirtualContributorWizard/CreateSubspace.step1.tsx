import React, { useMemo } from 'react';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import { Button, DialogActions, DialogContent } from '@mui/material';
import { Caption } from '../../../../core/ui/typography';
import { useTranslation } from 'react-i18next';
import Gutters from '../../../../core/ui/grid/Gutters';
import { LoadingButton } from '@mui/lab';
import useLoadingState from '../../../../domain/shared/utils/useLoadingState';
import { Formik } from 'formik';
import * as yup from 'yup';
import { displayNameValidator } from '../../../../core/ui/forms/validator';
import FormikInputField from '../../../../core/ui/forms/FormikInputField/FormikInputField';
import Loading from '../../../../core/ui/loading/Loading';

type CreateSubspaceStep1Props = {
  onClose: () => void;
  onBack: () => void;
  onCreateSubspace: (subspaceId: string) => Promise<void>;
  mySpaceName: string | undefined;
  loading: boolean;
};

const CreateSubspaceStep1 = ({ onClose, onBack, onCreateSubspace, mySpaceName, loading }: CreateSubspaceStep1Props) => {
  const { t } = useTranslation();

  const [handleContinue, loadingCreateSubspace] = useLoadingState(async (subspaceName: string) => {
    await onCreateSubspace(subspaceName);
  });

  const initialValues = useMemo(
    () => ({
      mySpaceName: mySpaceName ?? ' ', // A space character because MUI is doing something weird with the label
      subspaceName: '',
    }),
    [mySpaceName]
  );

  const validationSchema = yup.object().shape({
    subspaceName: displayNameValidator,
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
          <DialogHeader onClose={onClose}>{t('createVirtualContributorWizard.step1.title')}</DialogHeader>
          <DialogContent>
            <Gutters disablePadding>
              <Caption>{t('createVirtualContributorWizard.step1.description', { spaceName: mySpaceName })}</Caption>
              <FormikInputField
                name="mySpaceName"
                title={t('createVirtualContributorWizard.step1.spaceName')}
                disabled
                endAdornment={loading ? <Loading /> : undefined}
              />
              <FormikInputField
                name="subspaceName"
                title={t('createVirtualContributorWizard.step1.subspaceName')}
                required
              />
            </Gutters>
          </DialogContent>
          <DialogActions>
            <Button variant="text" onClick={onBack} disabled={loadingCreateSubspace}>
              {t('buttons.back')}
            </Button>
            <LoadingButton
              variant="contained"
              disabled={!isValid || loading}
              loading={loadingCreateSubspace}
              onClick={() => handleContinue(values.subspaceName)}
            >
              {t('buttons.continue')}
            </LoadingButton>
          </DialogActions>
        </>
      )}
    </Formik>
  );
};

export default CreateSubspaceStep1;
