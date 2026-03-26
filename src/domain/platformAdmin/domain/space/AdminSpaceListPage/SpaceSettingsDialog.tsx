import { Button, CircularProgress } from '@mui/material';
import { Formik } from 'formik';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import {
  refetchPlatformAdminSpacesListQuery,
  useUpdateSpacePlatformSettingsMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { SpaceVisibility } from '@/core/apollo/generated/graphql-schema';
import { Actions } from '@/core/ui/actions/Actions';
import PageContentBlockSeamless from '@/core/ui/content/PageContentBlockSeamless';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import FormikAutocomplete from '@/core/ui/forms/FormikAutocomplete';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import { textLengthValidator } from '@/core/ui/forms/validator/textLengthValidator';
import { gutters } from '@/core/ui/grid/utils';
import { BlockTitle } from '@/core/ui/typography';
import FlexSpacer from '@/core/ui/utils/FlexSpacer';
import { nameSegmentSchema } from '@/domain/platformAdmin/components/Common/NameSegment';
import type { SpaceTableItem } from '@/domain/platformAdmin/types/AdminTableItems';
import useLoadingState from '@/domain/shared/utils/useLoadingState';
import ManageLicensePlansDialog from './ManageLicensePlansDialog';

interface SpaceSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  space: SpaceTableItem | null;
}

const SpaceSettingsDialog = ({ open, onClose, space }: SpaceSettingsDialogProps) => {
  const { t } = useTranslation();
  const [isManageLicensePlansDialogOpen, setIsManageLicensePlansDialogOpen] = useState(false);

  const [updateSpacePlatformSettings] = useUpdateSpacePlatformSettingsMutation();

  const [handleSubmit, saving] = useLoadingState(
    async ({ nameId, visibility }: Partial<{ nameId: string; visibility: SpaceVisibility }>) => {
      if (!space) return;
      await updateSpacePlatformSettings({
        variables: {
          spaceId: space.spaceId,
          nameId: nameId!,
          visibility: visibility!,
        },
        refetchQueries: [refetchPlatformAdminSpacesListQuery()],
        awaitRefetchQueries: true,
      });
      onClose();
    }
  );

  const visibilitySelectOptions = [
    {
      id: SpaceVisibility.Active,
      name: t(`common.enums.space-visibility.${SpaceVisibility.Active}` as const) as string,
    },
    {
      id: SpaceVisibility.Archived,
      name: t(`common.enums.space-visibility.${SpaceVisibility.Archived}` as const) as string,
    },
    {
      id: SpaceVisibility.Demo,
      name: t(`common.enums.space-visibility.${SpaceVisibility.Demo}` as const) as string,
    },
    {
      id: SpaceVisibility.Inactive,
      name: t(`common.enums.space-visibility.${SpaceVisibility.Inactive}` as const) as string,
    },
  ] as const;

  const validationSchema = yup.object().shape({
    nameId: nameSegmentSchema.fields?.nameID || textLengthValidator({ required: true }),
    visibility: textLengthValidator({ required: true }),
  });

  const initialValues = {
    nameId: space?.nameId ?? '',
    visibility: space?.visibility ?? SpaceVisibility.Active,
  };

  return (
    <>
      <DialogWithGrid open={open} onClose={onClose} aria-labelledby="space-settings-dialog">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize={true}
          onSubmit={handleSubmit}
        >
          {({ handleSubmit, isValid }) => (
            <>
              <DialogHeader id="space-settings-dialog" onClose={onClose}>
                <BlockTitle>{t('pages.admin.spaces.spaceSettings')}</BlockTitle>
              </DialogHeader>
              <PageContentBlockSeamless>
                <FormikInputField
                  name="nameId"
                  title={t('components.nameSegment.nameID.title')}
                  placeholder={t('components.nameSegment.nameID.placeholder')}
                  required={true}
                  disabled={saving || !space?.canUpdate}
                />
                <FormikAutocomplete
                  name="visibility"
                  values={visibilitySelectOptions}
                  disablePortal={false}
                  disabled={saving || !space?.canUpdate}
                />
              </PageContentBlockSeamless>
              <Actions padding={gutters()}>
                <Button onClick={() => setIsManageLicensePlansDialogOpen(true)}>
                  {t('pages.admin.spaces.manageLicensePlans')}
                </Button>
                <FlexSpacer />
                <Button onClick={onClose}>{t('buttons.cancel')}</Button>
                <Button
                  variant="contained"
                  loading={saving}
                  onClick={() => handleSubmit()}
                  disabled={!isValid || !space?.canUpdate}
                >
                  {saving ? <CircularProgress size={20} /> : t('buttons.save')}
                </Button>
              </Actions>
            </>
          )}
        </Formik>
      </DialogWithGrid>
      {space && (
        <ManageLicensePlansDialog
          open={isManageLicensePlansDialogOpen}
          onClose={() => setIsManageLicensePlansDialogOpen(false)}
          spaceId={space.spaceId}
        />
      )}
    </>
  );
};

export default SpaceSettingsDialog;
