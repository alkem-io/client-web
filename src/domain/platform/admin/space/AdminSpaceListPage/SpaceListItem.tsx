import ListItemLink, { ListItemLinkProps } from '../../../../shared/components/SearchableList/ListItemLink';
import React, { MouseEventHandler, useCallback, useMemo, useState } from 'react';
import * as yup from 'yup';
import { sortBy } from 'lodash';
import DialogWithGrid from '../../../../../core/ui/dialog/DialogWithGrid';
import { Button, CircularProgress, DialogContent, ListItemIcon, TextField } from '@mui/material';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import DialogHeader from '../../../../../core/ui/dialog/DialogHeader';
import PageContentBlockSeamless from '../../../../../core/ui/content/PageContentBlockSeamless';
import { Formik } from 'formik';
import { Organization, SpaceVisibility, User } from '../../../../../core/apollo/generated/graphql-schema';
import FormikAutocomplete from '../../../../../core/ui/forms/FormikAutocomplete';
import { FormikSelectValue } from '../../../../../core/ui/forms/FormikSelect';
import {
  useAssignLicensePlanToAccountMutation,
  useRevokeLicensePlanFromAccountMutation,
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
import useLoadingState from '../../../../shared/utils/useLoadingState';
import PlansTable, { LicensePlan } from './PlansTable';
import AssignPlan from './AssignPlan';
import FlexSpacer from '../../../../../core/ui/utils/FlexSpacer';
import { Host, HostSelector } from './HostSelector';

export interface SpacePlatformSettings {
  nameId: string;
}

export interface AccountPlatformSettings {
  host: Host | undefined;
  visibility: SpaceVisibility;
  // organizations: {
  //   id: string;
  //   name: string;
  // }[];
  // users: User[];
  activeLicensePlanIds: string[] | undefined;
}

interface SpaceListItemProps extends ListItemLinkProps, SpacePlatformSettings {
  spaceId: string;
  accountId: string;
  account: AccountPlatformSettings;
  licensePlans: LicensePlan[] | undefined;
}

const SpaceListItem = ({
  spaceId,
  accountId,
  nameId,
  account: { visibility, host, /*organizations, users,*/ activeLicensePlanIds },
  licensePlans,
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
      host,
    },
    platformSettings: {
      nameId,
    },
  };

  const [updateAccountSettings] = useUpdateAccountPlatformSettingsMutation();
  const [updatePlatformSettings] = useUpdateSpacePlatformSettingsMutation();
  const [assignLicensePlan] = useAssignLicensePlanToAccountMutation();
  const [revokeLicensePlan] = useRevokeLicensePlanFromAccountMutation();

  const [handleSubmitAccountSettings, savingAccountSettings] = useLoadingState(
    async ({ visibility, host }: Partial<AccountPlatformSettings>) => {
      await updateAccountSettings({
        variables: {
          accountId,
          hostId: host?.id,
          license: {
            visibility,
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

  const accountSettingsValidationSchema = yup.object().shape({
    hostId: yup.string().required(t('forms.validations.required')),
    visibility: yup.string().required(t('forms.validations.required')),
  });

  const platformSettingsValidationSchema = yup.object().shape({
    nameId: nameSegmentSchema.fields?.nameID || yup.string(),
  });

  const [isManageLicensePlansDialogOpen, setIsManageLicensePlansDialogOpen] = useState(false);

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
                {/* <FormikAutocomplete
                  title={t('components.editSpaceForm.host.title')}
                  name="hostId"
                  values={[...organizations, ...users]} // + people
                  required
                  disabled={loading}
                  placeholder={t('components.editSpaceForm.host.title')}
                /> */}
                <HostSelector name="hostId" host={host} />
                <FormikAutocomplete
                  name="visibility"
                  values={visibilitySelectOptions}
                  disablePortal={false}
                  disabled={loading}
                />
              </PageContentBlockSeamless>
              <Actions padding={gutters()}>
                <Button onClick={() => setIsManageLicensePlansDialogOpen(true)}>{t('pages.admin.spaces.manageLicensePlans')}</Button>
                <FlexSpacer />
                <Button onClick={() => setSettingsModalOpen(false)}>{t('buttons.cancel')}</Button>
                <LoadingButton variant="contained" loading={loading} onClick={() => handleSubmit()}>
                  {t('buttons.save')}
                </LoadingButton>
              </Actions>
            </>
          )}
        </Formik>
      </DialogWithGrid>
      <DialogWithGrid open={isManageLicensePlansDialogOpen} onClose={() => setIsManageLicensePlansDialogOpen(false)}>
        <DialogHeader title={t('pages.admin.spaces.manageLicensePlans')} onClose={() => setIsManageLicensePlansDialogOpen(false)} />
        {licensePlans && (
          <PlansTable
            activeLicensePlanIds={activeLicensePlanIds}
            licensePlans={licensePlans}
            onDelete={plan => revokeLicensePlan({ variables: { accountId, licensePlanId: plan.id } })}
          />
        )}
        {licensePlans && (
          <AssignPlan
            onAssignPlan={licensePlanId => assignLicensePlan({ variables: { accountId, licensePlanId } })}
            licensePlans={licensePlans}
          />
        )}
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
