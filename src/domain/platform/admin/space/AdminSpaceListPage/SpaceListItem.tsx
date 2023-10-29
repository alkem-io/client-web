import ListItemLink, { ListItemLinkProps } from '../../../../shared/components/SearchableList/ListItemLink';
import React, { MouseEventHandler, useMemo, useState } from 'react';
import * as yup from 'yup';
import DialogWithGrid from '../../../../../core/ui/dialog/DialogWithGrid';
import { CircularProgress, ListItemIcon } from '@mui/material';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import DialogHeader from '../../../../../core/ui/dialog/DialogHeader';
import PageContentBlockSeamless from '../../../../../core/ui/content/PageContentBlockSeamless';
import { Formik } from 'formik';
import { SpaceVisibility } from '../../../../../core/apollo/generated/graphql-schema';
import FormikAutocomplete from '../../../../../core/ui/forms/FormikAutocomplete';
import { FormikSelectValue } from '../../../../../core/ui/forms/FormikSelect';
import { useUpdateSpacePlatformSettingsMutation } from '../../../../../core/apollo/generated/apollo-hooks';
import { useTranslation } from 'react-i18next';
import { BlockTitle } from '../../../../../core/ui/typography';
import { Actions } from '../../../../../core/ui/actions/Actions';
import FormikInputField from '../../../../../core/ui/forms/FormikInputField/FormikInputField';
import { nameSegmentSchema } from '../../components/Common/NameSegment';
import { LoadingButton } from '@mui/lab';
import { gutters } from '../../../../../core/ui/grid/utils';

export interface SpacePlatformSettings {
  nameID: string;
  hostID: string | undefined;
  visibility: SpaceVisibility;
  whiteboardRtEnabled: boolean;
  organizations: {
    id: string;
    name: string;
  }[];
}

interface SpaceListItemProps extends ListItemLinkProps, SpacePlatformSettings {
  spaceId: string;
}

const SpaceListItem = ({
  spaceId,
  visibility,
  nameID,
  hostID,
  organizations,
  whiteboardRtEnabled,
  ...props
}: SpaceListItemProps) => {
  const [isPlatformSettingsModalOpen, setIsPlatformSettingsModalOpen] = useState(false);

  const handlePlatformSettingsClick: MouseEventHandler = event => {
    event.preventDefault();
    event.stopPropagation();
    setIsPlatformSettingsModalOpen(true);
  };

  const initialValues = {
    visibility,
    nameID,
    hostID,
    whiteboardRtEnabled,
  };

  const [updatePlatformSettings, { loading }] = useUpdateSpacePlatformSettingsMutation();

  const handleSubmit = async ({ visibility, nameID, hostID, whiteboardRtEnabled }: Partial<SpacePlatformSettings>) => {
    // Todo: this must be possible to have cleaner...
    let whiteboardRtEnabledResult = false;
    if (whiteboardRtEnabled && whiteboardRtEnabled === true) whiteboardRtEnabledResult = true;
    await updatePlatformSettings({
      variables: {
        spaceID: spaceId,
        hostID,
        nameID,
        license: {
          visibility,
          featureFlags: [
            {
              name: 'whiteboard-rt',
              enabled: whiteboardRtEnabledResult,
            },
          ],
        },
      },
    });
    setIsPlatformSettingsModalOpen(false);
  };

  const { t } = useTranslation();

  const visiblitySelectOptions = useMemo<readonly FormikSelectValue[]>(
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

  const flagSelectOptions = useMemo<readonly FormikSelectValue[]>(
    () =>
      [
        {
          id: 'true',
          name: 'true' as string,
        },
        {
          id: 'false',
          name: 'false' as string,
        },
      ] as const,
    [t]
  );

  const validationSchema = yup.object().shape({
    nameID: nameSegmentSchema.fields?.nameID || yup.string(),
    hostID: yup.string().required(t('forms.validations.required')),
    visibility: yup.string().required(t('forms.validations.required')),
    whiteboardRtEnabled: yup.string().required(t('forms.validations.required')),
  });

  return (
    <>
      <ListItemLink
        {...props}
        actions={
          <ListItemIcon onClick={loading ? undefined : handlePlatformSettingsClick}>
            {loading ? <CircularProgress size={24} /> : <SettingsOutlinedIcon />}
          </ListItemIcon>
        }
      />
      <DialogWithGrid open={isPlatformSettingsModalOpen} onClose={() => setIsPlatformSettingsModalOpen(false)}>
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
          {({ handleSubmit }) => (
            <>
              <DialogHeader onClose={() => setIsPlatformSettingsModalOpen(false)}>
                <BlockTitle>{t('pages.admin.spaces.spaceSettings')}</BlockTitle>
              </DialogHeader>
              <PageContentBlockSeamless>
                <FormikInputField
                  name="nameID"
                  title={t('components.nameSegment.nameID.title')}
                  placeholder={t('components.nameSegment.nameID.placeholder')}
                  required
                  disabled={loading}
                />
                <FormikAutocomplete
                  title={t('components.editSpaceForm.host.title')}
                  name="hostID"
                  values={organizations}
                  required
                  disabled={loading}
                  placeholder={t('components.editSpaceForm.host.title')}
                />
                <FormikAutocomplete
                  name="visibility"
                  values={visiblitySelectOptions}
                  disablePortal={false}
                  disabled={loading}
                />
                <FormikAutocomplete
                  name="whiteboardRtEnabled"
                  values={flagSelectOptions}
                  disablePortal={false}
                  disabled={loading}
                />
              </PageContentBlockSeamless>
              <Actions padding={gutters()} justifyContent="end">
                <LoadingButton variant="contained" loading={loading} onClick={() => handleSubmit()}>
                  {t('buttons.save')}
                </LoadingButton>
              </Actions>
            </>
          )}
        </Formik>
      </DialogWithGrid>
    </>
  );
};

export default SpaceListItem;
