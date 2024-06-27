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
import FormikInputField from '../../../../core/ui/forms/FormikInputField/FormikInputField';
import Loading from '../../../../core/ui/loading/Loading';
import FormikSelect from '../../../../core/ui/forms/FormikSelect';

type ChooseSubspaceStep1bProps = {
  onClose: () => void;
  onBack: () => void;
  onChooseSubspace: (subspaceId: string) => Promise<void>;
  selectedSubspaceId?: string;
  mySpaceName: string | undefined;
  subspaces: { id: string; name: string }[];
  loading: boolean;
};

const ChooseSubspaceStep1b = ({
  onClose,
  onBack,
  onChooseSubspace,
  selectedSubspaceId,
  mySpaceName,
  subspaces,
  loading,
}: ChooseSubspaceStep1bProps) => {
  const { t } = useTranslation();

  const [handleContinue, loadingChooseSubspace] = useLoadingState(async (subspaceId: string) => {
    await onChooseSubspace(subspaceId);
  });

  const initialValues = useMemo(
    () => ({
      mySpaceName: mySpaceName ?? ' ', // A space character because MUI is doing something weird with the label
      subspaceId: selectedSubspaceId ?? '',
    }),
    [mySpaceName, selectedSubspaceId]
  );

  const validationSchema = yup.object().shape({
    subspaceId: yup.string().required(),
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
          <DialogHeader onClose={onClose}>{t('createVirtualContributorWizard.step1b.title')}</DialogHeader>
          <DialogContent>
            <Gutters disablePadding>
              <Caption>{t('createVirtualContributorWizard.step1b.description')}</Caption>
              <FormikInputField
                name="mySpaceName"
                title={t('createVirtualContributorWizard.step1b.spaceName')}
                disabled
                endAdornment={loading ? <Loading /> : undefined}
              />
              <FormikSelect
                name="subspaceId"
                title={t('createVirtualContributorWizard.step1b.subspaceName')}
                values={subspaces}
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
              disabled={!isValid || loading}
              loading={loadingChooseSubspace}
              onClick={() => handleContinue(values.subspaceId)}
            >
              {t('buttons.continue')}
            </LoadingButton>
          </DialogActions>
        </>
      )}
    </Formik>
  );
};

export default ChooseSubspaceStep1b;
