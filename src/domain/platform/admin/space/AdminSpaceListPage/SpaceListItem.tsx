import ListItemLink, { ListItemLinkProps } from '../../../../shared/components/SearchableList/ListItemLink';
import React, { MouseEventHandler, useMemo, useState } from 'react';
import * as yup from 'yup';
import DialogWithGrid from '../../../../../core/ui/dialog/DialogWithGrid';
import { Button, CircularProgress, DialogContent, FormLabel, ListItemIcon, RadioGroup, TextField } from '@mui/material';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import DialogHeader from '../../../../../core/ui/dialog/DialogHeader';
import PageContentBlockSeamless from '../../../../../core/ui/content/PageContentBlockSeamless';
import { Formik } from 'formik';
import { LicenseFeatureFlagName, SpaceVisibility } from '../../../../../core/apollo/generated/graphql-schema';
import FormikAutocomplete from '../../../../../core/ui/forms/FormikAutocomplete';
import { FormikSelectValue } from '../../../../../core/ui/forms/FormikSelect';
import {
  useUpdateAccountPlatformSettingsMutation,
  useUpdateSpacePlatformSettingsMutation,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { useTranslation } from 'react-i18next';
import { BlockTitle } from '../../../../../core/ui/typography';
import { Actions } from '../../../../../core/ui/actions/Actions';
import FormikInputField from '../../../../../core/ui/forms/FormikInputField/FormikInputField';
import { nameSegmentSchema } from '../../components/Common/NameSegment';
import { LoadingButton } from '@mui/lab';
import { gutters } from '../../../../../core/ui/grid/utils';
import FormikCheckboxField from '../../../../../core/ui/forms/FormikCheckboxField';
import useLoadingState from '../../../../shared/utils/useLoadingState';

export interface SpacePlatformSettings {
  nameId: string;
}

export interface AccountPlatformSettings {
  hostId: string | undefined;
  visibility: SpaceVisibility;
  features: Record<LicenseFeatureFlagName, boolean>;
  organizations: {
    id: string;
    name: string;
  }[];
}

interface SpaceListItemProps extends ListItemLinkProps, SpacePlatformSettings {
  spaceId: string;
  accountId: string;
  account: AccountPlatformSettings;
}

const SpaceListItem = ({
  spaceId,
  accountId,
  nameId,
  account: { visibility, hostId, organizations, features },
  ...props
}: SpaceListItemProps) => {
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
  const [isPlatformSettingsModalOpen, setPlatformSettingsModalOpen] = useState(false);

  const handlePlatformSettingsClick: MouseEventHandler = event => {
    event.preventDefault();
    event.stopPropagation();
    setSettingsModalOpen(true);
  };

  const initialValues = {
    accountSettings: {
      visibility,
      hostId,
      features,
    },
    platformSettings: {
      nameId,
    },
  };

  const [updateAccountSettings] = useUpdateAccountPlatformSettingsMutation();
  const [updatePlatformSettings] = useUpdateSpacePlatformSettingsMutation();

  const [handleSubmitAccountSettings, savingAccountSettings] = useLoadingState(
    async ({ visibility, hostId, features }: Partial<AccountPlatformSettings>) => {
      await updateAccountSettings({
        variables: {
          accountId,
          hostId,
          license: {
            visibility,
            featureFlags: Object.keys(features ?? {}).map(feature => ({ name: feature, enabled: features![feature] })),
          },
        },
      });
      setSettingsModalOpen(false);
      setPlatformSettingsModalOpen(false);
    }
  );

  const [handleSubmitPlatformSettings, savingPlatformSettings] = useLoadingState(
    async ({ nameId }: Partial<SpacePlatformSettings>) => {
      await updatePlatformSettings({
        variables: {
          spaceId,
          nameId: nameId!,
        },
      });
      setPlatformSettingsModalOpen(false);
    }
  );
  const loading = savingAccountSettings || savingPlatformSettings;

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

  const accountSettingsValidationSchema = yup.object().shape({
    hostId: yup.string().required(t('forms.validations.required')),
    visibility: yup.string().required(t('forms.validations.required')),
    features: yup.object().shape(
      Object.keys(features).reduce((acc, cur) => {
        acc[cur] = yup.boolean().required(t('forms.validations.required'));
        return acc;
      }, {})
    ),
  });

  const platformSettingsValidationSchema = yup.object().shape({
    nameId: nameSegmentSchema.fields?.nameID || yup.string(),
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
      <DialogWithGrid open={isSettingsModalOpen} onClose={() => setSettingsModalOpen(false)}>
        <Formik
          initialValues={initialValues.accountSettings}
          validationSchema={accountSettingsValidationSchema}
          onSubmit={handleSubmitAccountSettings}
        >
          {({ handleSubmit }) => (
            <>
              <DialogHeader onClose={() => setSettingsModalOpen(false)}>
                <BlockTitle>{t('pages.admin.spaces.spaceSettings')}</BlockTitle>
              </DialogHeader>
              <PageContentBlockSeamless>
                <TextField
                  value={initialValues.platformSettings.nameId}
                  title={t('components.nameSegment.nameID.title')}
                  placeholder={t('components.nameSegment.nameID.placeholder')}
                  disabled
                  InputProps={{
                    endAdornment: (
                      <Button onClick={() => setPlatformSettingsModalOpen(true)}>{t('buttons.change')}</Button>
                    ),
                  }}
                />
                <FormikAutocomplete
                  title={t('components.editSpaceForm.host.title')}
                  name="hostId"
                  values={organizations}
                  required
                  disabled
                  placeholder={t('components.editSpaceForm.host.title')}
                />
                <FormikAutocomplete
                  name="visibility"
                  values={visiblitySelectOptions}
                  disablePortal={false}
                  disabled={loading}
                />
                <RadioGroup>
                  <FormLabel component="legend">{t('pages.admin.space.settings.license-features.title')}</FormLabel>
                  {Object.keys(features)
                    .map(key => key as LicenseFeatureFlagName)
                    .map(key => (
                      <FormikCheckboxField
                        key={`feature-checkbox-${key}`}
                        title={t(`pages.admin.space.settings.license-features.features.${key}` as const)}
                        name={`features.${key}`}
                        disabled={loading}
                      />
                    ))}
                </RadioGroup>
              </PageContentBlockSeamless>
              <Actions padding={gutters()} justifyContent="end">
                <Button onClick={() => setSettingsModalOpen(false)}>{t('buttons.cancel')}</Button>
                <LoadingButton variant="contained" loading={loading} onClick={() => handleSubmit()}>
                  {t('buttons.save')}
                </LoadingButton>
              </Actions>
            </>
          )}
        </Formik>
      </DialogWithGrid>
      <DialogWithGrid open={isPlatformSettingsModalOpen} onClose={() => setSettingsModalOpen(false)}>
        <Formik
          initialValues={initialValues.platformSettings}
          validationSchema={platformSettingsValidationSchema}
          onSubmit={handleSubmitPlatformSettings}
        >
          {({ handleSubmit }) => (
            <>
              <DialogHeader onClose={() => setPlatformSettingsModalOpen(false)}>
                <BlockTitle>{t('pages.admin.spaces.changeNameId')}</BlockTitle>
              </DialogHeader>
              <DialogContent>
                <FormikInputField
                  name="nameId"
                  title={t('components.nameSegment.nameID.title')}
                  placeholder={t('components.nameSegment.nameID.placeholder')}
                  required
                />
              </DialogContent>
              <Actions padding={gutters()} justifyContent="end">
                <Button onClick={() => setPlatformSettingsModalOpen(false)}>{t('buttons.cancel')}</Button>
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
