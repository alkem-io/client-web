import React from 'react';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { Button, DialogActions, DialogContent } from '@mui/material';
import { Caption } from '@/core/ui/typography';
import { useTranslation } from 'react-i18next';
import Gutters from '@/core/ui/grid/Gutters';
import { LoadingButton } from '@mui/lab';
import { Formik } from 'formik';
import * as yup from 'yup';
import FormikSelect from '@/core/ui/forms/FormikSelect';

export interface SelectableKnowledgeProps {
  id: string;
  name: string;
  accountId: string;
  url: string | undefined;
  roleSetId?: string;
  parentRoleSetId?: string;
}

interface ExistingSpaceProps {
  onClose: () => void;
  onBack: () => void;
  onSubmit: (subspace: SelectableKnowledgeProps) => void;
  availableSpaces: SelectableKnowledgeProps[];
  loading: boolean;
}

const ExistingSpace = ({ onClose, onBack, onSubmit, availableSpaces, loading }: ExistingSpaceProps) => {
  const { t } = useTranslation();

  const initialValues = {
    subspaceId: '',
  };

  const validationSchema = yup.object().shape({
    subspaceId: yup.string().required(),
  });

  const onCreate = (values: { subspaceId: string }) => {
    const bok = availableSpaces.filter(s => s.id === values.subspaceId)[0];
    bok && onSubmit(bok);
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize
      validateOnMount
      onSubmit={onCreate}
    >
      {({ values, isValid }) => (
        <>
          <DialogHeader onClose={onClose} title={t('createVirtualContributorWizard.existingSpace.title')} />
          <DialogContent>
            {(!availableSpaces || availableSpaces.length === 0) && (
              <Caption>{t('createVirtualContributorWizard.existingSpace.noSpaces')}</Caption>
            )}
            {availableSpaces && availableSpaces.length > 0 && (
              <Gutters disablePadding>
                <Caption>{t('createVirtualContributorWizard.existingSpace.description')}</Caption>
                <FormikSelect
                  name="subspaceId"
                  title={t('createVirtualContributorWizard.existingSpace.label')}
                  values={availableSpaces}
                  required
                />
              </Gutters>
            )}
          </DialogContent>
          <DialogActions>
            <Button variant="text" onClick={onBack}>
              {t('buttons.back')}
            </Button>
            {availableSpaces && availableSpaces.length > 0 && (
              <LoadingButton
                variant="contained"
                disabled={!isValid || loading}
                loading={loading}
                onClick={() => onCreate(values)}
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
