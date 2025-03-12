import { useMemo, useState } from 'react';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { Button, DialogActions, DialogContent } from '@mui/material';
import { Caption } from '@/core/ui/typography';
import { useTranslation } from 'react-i18next';
import Gutters from '@/core/ui/grid/Gutters';
import { LoadingButton } from '@mui/lab';
import { Formik } from 'formik';
import * as yup from 'yup';
import FormikAutocomplete from '@/core/ui/forms/FormikAutocomplete';
import ConfirmationDialog from '@/core/ui/dialogs/ConfirmationDialog';
import { SelectableSpace } from './useVirtualContributorWizard';
import { SelectableKnowledgeSpace } from './ExistingSpace';

interface ChooseCommunityProps {
  onClose: () => void;
  onSubmit: (space: SelectableKnowledgeSpace) => void;
  vcName?: string;
  loading: boolean;
  spaces: SelectableSpace[];
}

const ChooseCommunity = ({ onClose, onSubmit, vcName = '', spaces, loading }: ChooseCommunityProps) => {
  const { t } = useTranslation();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const onCancel = () => {
    setConfirmDialogOpen(true);
  };

  const onConfirmCancel = () => {
    setConfirmDialogOpen(false);
  };

  const listItems = useMemo(() => {
    const result: SelectableKnowledgeSpace[] = [];
    const addSelectableSpace = (space: SelectableSpace) => {
      result.push({
        id: space.id,
        name: `${space.about.profile.displayName}`,
        url: space.about.profile.url,
        roleSetId: space.community.roleSet.id,
      });
    };

    spaces?.forEach((space: SelectableSpace) => {
      addSelectableSpace(space);
    });

    return result;
  }, [spaces]);

  const initialValues = {
    spaceId: '',
  };

  const validationSchema = yup.object().shape({
    spaceId: yup.string(),
  });

  const onCreate = (values: { spaceId: string }) => {
    const bok = listItems.filter(s => s.id === values.spaceId)[0];
    onSubmit(bok);
  };

  const hasAvailableSpaces = spaces && spaces.length > 0;

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize
      validateOnMount
      onSubmit={onCreate}
    >
      {({ values }) => (
        <>
          <DialogHeader
            onClose={onCancel}
            title={t('createVirtualContributorWizard.chooseCommunity.title', {
              vcName,
            })}
          />
          <DialogContent>
            <Gutters disablePadding>
              <Caption>{t('createVirtualContributorWizard.chooseCommunity.description')}</Caption>
              <FormikAutocomplete
                name="spaceId"
                disabled={loading || !hasAvailableSpaces}
                title={t('createVirtualContributorWizard.chooseCommunity.label')}
                values={listItems}
                disablePortal={false}
                placeholder={
                  hasAvailableSpaces
                    ? t('createVirtualContributorWizard.chooseCommunity.selectSpacesPlaceholder')
                    : t('createVirtualContributorWizard.chooseCommunity.noSpacesPlaceholder')
                }
              />
            </Gutters>
          </DialogContent>
          <DialogActions>
            <Button variant="text" onClick={onCancel}>
              {t('createVirtualContributorWizard.chooseCommunity.cancelAddToCommunity')}
            </Button>
            <LoadingButton
              variant="contained"
              disabled={loading || (hasAvailableSpaces && !values.spaceId)}
              loading={loading}
              onClick={() => onCreate(values)}
            >
              {t('createVirtualContributorWizard.chooseCommunity.addToCommunity')}
            </LoadingButton>
          </DialogActions>
          <ConfirmationDialog
            actions={{
              onConfirm: onClose,
              onCancel: onConfirmCancel,
            }}
            options={{
              show: confirmDialogOpen,
            }}
            entities={{
              titleId: 'createVirtualContributorWizard.chooseCommunity.confirm.title',
              contentId: 'createVirtualContributorWizard.chooseCommunity.confirm.description',
              confirmButtonTextId: 'createVirtualContributorWizard.chooseCommunity.cancelAddToCommunity',
            }}
          />
        </>
      )}
    </Formik>
  );
};

export default ChooseCommunity;
