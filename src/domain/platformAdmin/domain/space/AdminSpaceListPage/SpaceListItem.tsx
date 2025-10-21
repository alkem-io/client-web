import React, { MouseEventHandler, useMemo, useState } from 'react';
import * as yup from 'yup';
import { Formik } from 'formik';
import { Box, Button, Chip, CircularProgress, ListItemIcon, Typography } from '@mui/material';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { useTranslation } from 'react-i18next';
import { SpacePrivacyMode, SpaceVisibility } from '@/core/apollo/generated/graphql-schema';
import {
  refetchPlatformAdminSpacesListQuery,
  useUpdateSpacePlatformSettingsMutation,
} from '@/core/apollo/generated/apollo-hooks';
import ListItemLink, { ListItemLinkProps } from '@/domain/shared/components/SearchableList/ListItemLink';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import PageContentBlockSeamless from '@/core/ui/content/PageContentBlockSeamless';
import { BlockTitle } from '@/core/ui/typography';
import { Actions } from '@/core/ui/actions/Actions';
import { nameSegmentSchema } from '@/domain/platformAdmin/components/Common/NameSegment';
import { gutters } from '@/core/ui/grid/utils';
import useLoadingState from '@/domain/shared/utils/useLoadingState';
import FlexSpacer from '@/core/ui/utils/FlexSpacer';
import FormikAutocomplete from '@/core/ui/forms/FormikAutocomplete';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import { FormikSelectValue } from '@/core/ui/forms/FormikSelect';
import { textLengthValidator } from '@/core/ui/forms/validator/textLengthValidator';
import ManageLicensePlansDialog from './ManageLicensePlansDialog';

export interface SpacePlatformSettings {
  nameId: string;
  visibility: SpaceVisibility;
}

interface SpaceListItemV2Props extends ListItemLinkProps, SpacePlatformSettings {
  spaceId: string;
  canUpdate: boolean;
  privacyMode: SpacePrivacyMode;
  accountOwner?: string;
}

const SpaceListItem = ({
  spaceId,
  nameId,
  visibility,
  privacyMode,
  accountOwner,
  canUpdate,
  ...props
}: SpaceListItemV2Props) => {
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
  const [isManageLicensePlansDialogOpen, setIsManageLicensePlansDialogOpen] = useState(false);

  const handlePlatformSettingsClick: MouseEventHandler = event => {
    event.preventDefault();
    event.stopPropagation();
    setSettingsModalOpen(true);
  };

  const initialValues = {
    nameId,
    visibility,
  };

  const [updateSpacePlatformSettings] = useUpdateSpacePlatformSettingsMutation();

  const [handleSubmit, saving] = useLoadingState(async ({ nameId, visibility }: Partial<SpacePlatformSettings>) => {
    await updateSpacePlatformSettings({
      variables: {
        spaceId,
        nameId: nameId!,
        visibility: visibility!,
      },
      refetchQueries: [refetchPlatformAdminSpacesListQuery()],
      awaitRefetchQueries: true,
    });
    setSettingsModalOpen(false);
  });

  const { t } = useTranslation();

  const visibilitySelectOptions = useMemo<readonly FormikSelectValue[]>(
    () =>
      [
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
      ] as const,
    [t]
  );

  const validationSchema = yup.object().shape({
    nameId: nameSegmentSchema.fields?.nameID || textLengthValidator({ required: true }),
    visibility: textLengthValidator({ required: true }),
  });

  return (
    <>
      <ListItemLink
        {...props}
        primary={
          <Box display="flex" alignItems="center" gap={2} width="100%">
            {/* Name Column */}
            <Box flex={2} minWidth={0}>
              <Typography variant="body1" fontWeight={500} noWrap>
                {props.primary}
              </Typography>
            </Box>

            {/* Visibility Column */}
            <Box flex={1} minWidth="100px">
              <Chip
                label={visibility}
                size="small"
                color={visibility === SpaceVisibility.Active ? 'success' : 'default'}
                variant="outlined"
              />
            </Box>

            {/* Privacy Mode Column */}
            <Box flex={1} minWidth="100px">
              <Chip
                label={privacyMode}
                size="small"
                color={privacyMode === SpacePrivacyMode.Public ? 'info' : 'default'}
                variant="outlined"
              />
            </Box>

            {/* Account Owner Column */}
            <Box flex={1} minWidth="150px">
              <Typography variant="body2" color="text.secondary" noWrap title={accountOwner}>
                {accountOwner || 'N/A'}
              </Typography>
            </Box>
          </Box>
        }
        actions={
          <ListItemIcon onClick={saving ? undefined : handlePlatformSettingsClick}>
            {saving ? <CircularProgress size={24} /> : <SettingsOutlinedIcon />}
          </ListItemIcon>
        }
      />
      <DialogWithGrid
        open={isSettingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        aria-labelledby="space-settings-dialog"
      >
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
          {({ handleSubmit, isValid }) => (
            <>
              <DialogHeader id="space-settings-dialog" onClose={() => setSettingsModalOpen(false)}>
                <BlockTitle>{t('pages.admin.spaces.spaceSettings')}</BlockTitle>
              </DialogHeader>
              <PageContentBlockSeamless>
                <FormikInputField
                  name="nameId"
                  title={t('components.nameSegment.nameID.title')}
                  placeholder={t('components.nameSegment.nameID.placeholder')}
                  required
                  disabled={saving || !canUpdate}
                />
                <FormikAutocomplete
                  name="visibility"
                  values={visibilitySelectOptions}
                  disablePortal={false}
                  disabled={saving || !canUpdate}
                />
              </PageContentBlockSeamless>
              <Actions padding={gutters()}>
                <Button onClick={() => setIsManageLicensePlansDialogOpen(true)}>
                  {t('pages.admin.spaces.manageLicensePlans')}
                </Button>
                <FlexSpacer />
                <Button onClick={() => setSettingsModalOpen(false)}>{t('buttons.cancel')}</Button>
                <Button
                  variant="contained"
                  loading={saving}
                  onClick={() => handleSubmit()}
                  disabled={!isValid || !canUpdate}
                >
                  {t('buttons.save')}
                </Button>
              </Actions>
            </>
          )}
        </Formik>
      </DialogWithGrid>
      {/* License plans dialog - only loads data when opened */}
      <ManageLicensePlansDialog
        open={isManageLicensePlansDialogOpen}
        onClose={() => setIsManageLicensePlansDialogOpen(false)}
        spaceId={spaceId}
      />
    </>
  );
};

export default SpaceListItem;
