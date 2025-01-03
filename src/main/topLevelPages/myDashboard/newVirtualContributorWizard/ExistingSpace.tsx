import React, { useMemo } from 'react';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { Button, DialogActions, DialogContent } from '@mui/material';
import { Caption } from '@/core/ui/typography';
import { useTranslation } from 'react-i18next';
import Gutters from '@/core/ui/grid/Gutters';
import { LoadingButton } from '@mui/lab';
import { Formik } from 'formik';
import * as yup from 'yup';
import FormikAutocomplete from '@/core/ui/forms/FormikAutocomplete';
import { SelectableSpace } from './useNewVirtualContributorWizard';

export interface SelectableKnowledgeSpace {
  id: string;
  name: string;
  url: string | undefined;
  roleSetId?: string;
  parentRoleSetId?: string;
}

interface ExistingSpaceProps {
  onClose: () => void;
  onBack: () => void;
  onSubmit: (subspace: SelectableKnowledgeSpace) => void;
  availableSpaces: SelectableSpace[];
  loading: boolean;
}

const ExistingSpace = ({ onClose, onBack, onSubmit, availableSpaces, loading }: ExistingSpaceProps) => {
  const { t } = useTranslation();

  const initialValues = {
    subspaceId: '',
  };

  const listItems = useMemo(() => {
    const result: SelectableKnowledgeSpace[] = [];
    const addSelectableSpace = (space: SelectableSpace, parentSpace?: SelectableSpace) => {
      result.push({
        id: space.id,
        name: `${space.profile.displayName}${parentSpace ? '' : ` (${t('common.space')})`}`,
        url: parentSpace ? parentSpace.profile.url : space.profile.url,
        roleSetId: space.community.roleSet.id,
        parentRoleSetId: parentSpace?.community.roleSet.id,
      });
    };

    availableSpaces.forEach((space: SelectableSpace) => {
      addSelectableSpace(space);
      space.subspaces?.forEach(subspace => {
        addSelectableSpace(subspace, space);
        subspace.subspaces?.forEach(subsubspace => {
          addSelectableSpace(subsubspace, subspace);
        });
      });
    });
    return result;
  }, [availableSpaces]);

  const validationSchema = yup.object().shape({
    subspaceId: yup.string().required(),
  });

  const onCreate = (values: { subspaceId: string }) => {
    const bok = listItems.filter(s => s.id === values.subspaceId)[0];
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
          <DialogHeader onClose={onClose}>{t('createVirtualContributorWizard.existingSpace.title')}</DialogHeader>
          <DialogContent>
            {(!availableSpaces || availableSpaces.length === 0) && (
              <Caption>{t('createVirtualContributorWizard.existingSpace.noSpaces')}</Caption>
            )}
            {availableSpaces && availableSpaces.length > 0 && (
              <Gutters disablePadding>
                <Caption>{t('createVirtualContributorWizard.existingSpace.description')}</Caption>
                <FormikAutocomplete
                  name="subspaceId"
                  title={t('createVirtualContributorWizard.existingSpace.label')}
                  values={listItems}
                  required
                  disablePortal={false}
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
