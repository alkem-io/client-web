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
import FormikSelect from '../../../../core/ui/forms/FormikSelect';

type ExistingSpaceProps = {
  onClose: () => void;
  onBack: () => void;
  onChooseSubspace: (subspaceId: string) => Promise<void>;
  selectedSubspaceId?: string;
  subspaces: { id: string; name: string }[];
  loading: boolean;
};

const ExistingSpace = ({
  onClose,
  onBack,
  onChooseSubspace,
  selectedSubspaceId,
  subspaces,
  loading,
}: ExistingSpaceProps) => {
  const { t } = useTranslation();

  const [handleContinue, loadingChooseSubspace] = useLoadingState(async (subspaceId: string) => {
    await onChooseSubspace(subspaceId);
  });

  const initialValues = useMemo(
    () => ({
      subspaceId: selectedSubspaceId ?? '',
    }),
    [selectedSubspaceId]
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
          <DialogHeader onClose={onClose}>{t('createVirtualContributorWizard.existingSpace.title')}</DialogHeader>
          <DialogContent>
            {(!subspaces || subspaces.length === 0) && (
              <Caption>{t('createVirtualContributorWizard.existingSpace.noSpaces')}</Caption>
            )}
            {subspaces && subspaces.length > 0 && (
              <Gutters disablePadding>
                <Caption>{t('createVirtualContributorWizard.existingSpace.description')}</Caption>
                <FormikSelect
                  name="subspaceId"
                  title={t('createVirtualContributorWizard.existingSpace.label')}
                  values={subspaces}
                  required
                />
              </Gutters>
            )}
          </DialogContent>
          <DialogActions>
            <Button variant="text" onClick={onBack}>
              {t('buttons.back')}
            </Button>
            {subspaces && subspaces.length > 0 && (
              <LoadingButton
                variant="contained"
                disabled={!isValid || loading}
                loading={loadingChooseSubspace}
                onClick={() => handleContinue(values.subspaceId)}
              >
                {t('buttons.create')}
              </LoadingButton>
            )}
          </DialogActions>
        </>
      )}
    </Formik>
  );
};

export default ExistingSpace;
