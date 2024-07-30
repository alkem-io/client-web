import React, { MouseEventHandler, useMemo, useState } from 'react';
import * as yup from 'yup';
import { Formik } from 'formik';
import { Button, CircularProgress, DialogContent, ListItemIcon } from '@mui/material';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { useTranslation } from 'react-i18next';
import { SpaceVisibility } from '../../../../../core/apollo/generated/graphql-schema';
import {
  refetchAdminSpacesListQuery,
  useAssignLicensePlanToAccountMutation,
  useRevokeLicensePlanFromAccountMutation,
  useUpdateAccountPlatformSettingsMutation,
  useUpdateSpacePlatformSettingsMutation,
} from '../../../../../core/apollo/generated/apollo-hooks';
import ListItemLink, { ListItemLinkProps } from '../../../../shared/components/SearchableList/ListItemLink';
import DialogWithGrid from '../../../../../core/ui/dialog/DialogWithGrid';
import DialogHeader from '../../../../../core/ui/dialog/DialogHeader';
import PageContentBlockSeamless from '../../../../../core/ui/content/PageContentBlockSeamless';
import { BlockTitle } from '../../../../../core/ui/typography';
import { Actions } from '../../../../../core/ui/actions/Actions';
import { nameSegmentSchema } from '../../components/Common/NameSegment';
import { LoadingButton } from '@mui/lab';
import { gutters } from '../../../../../core/ui/grid/utils';
import useLoadingState from '../../../../shared/utils/useLoadingState';
import PlansTable, { LicensePlan } from './PlansTable';
import AssignPlan from './AssignPlan';
import FlexSpacer from '../../../../../core/ui/utils/FlexSpacer';
import { Host, HostSelector } from './HostSelector';
import FormikAutocomplete from '../../../../../core/ui/forms/FormikAutocomplete';
import FormikInputField from '../../../../../core/ui/forms/FormikInputField/FormikInputField';
import { FormikSelectValue } from '../../../../../core/ui/forms/FormikSelect';

export interface SpacePlatformSettings {
  nameId: string;
  visibility: SpaceVisibility;
}

export interface AccountPlatformSettings {
  host: Host | undefined;
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
  account: { host, activeLicensePlanIds },
  licensePlans,
  visibility,
  ...props
}: SpaceListItemProps) => {
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);

  const handlePlatformSettingsClick: MouseEventHandler = event => {
    event.preventDefault();
    event.stopPropagation();
    setSettingsModalOpen(true);
  };

  const initialValues = {
    host,
    nameId,
    visibility,
  };

  const [updateAccountSettings] = useUpdateAccountPlatformSettingsMutation();
  const [updatePlatformSettings] = useUpdateSpacePlatformSettingsMutation();
  const [assignLicensePlan] = useAssignLicensePlanToAccountMutation();
  const [revokeLicensePlan] = useRevokeLicensePlanFromAccountMutation();

  const [handleSubmit, saving] = useLoadingState(
    async ({ host, nameId, visibility }: Partial<AccountPlatformSettings & SpacePlatformSettings>) => {
      await updateAccountSettings({
        variables: {
          accountId,
          hostId: host?.id,
        },
      });
      await updatePlatformSettings({
        variables: {
          spaceId,
          nameId: nameId!,
          visibility: visibility!,
        },
        refetchQueries: [refetchAdminSpacesListQuery()],
        awaitRefetchQueries: true,
      });
      setSettingsModalOpen(false);
    }
  );

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
    host: yup.object().shape({ id: yup.string() }).required(t('forms.validations.required')),
    nameId: nameSegmentSchema.fields?.nameID || yup.string().required(t('forms.validations.required')),
    visibility: yup.string().required(t('forms.validations.required')),
  });

  const [isManageLicensePlansDialogOpen, setIsManageLicensePlansDialogOpen] = useState(false);

  return (
    <>
      <ListItemLink
        {...props}
        actions={
          <ListItemIcon onClick={saving ? undefined : handlePlatformSettingsClick}>
            {saving ? <CircularProgress size={24} /> : <SettingsOutlinedIcon />}
          </ListItemIcon>
        }
      />
      <DialogWithGrid open={isSettingsModalOpen} onClose={() => setSettingsModalOpen(false)}>
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
          {({ handleSubmit, isValid }) => (
            <>
              <DialogHeader onClose={() => setSettingsModalOpen(false)}>
                <BlockTitle>{t('pages.admin.spaces.spaceSettings')}</BlockTitle>
              </DialogHeader>
              <PageContentBlockSeamless>
                <FormikInputField
                  name="nameId"
                  title={t('components.nameSegment.nameID.title')}
                  placeholder={t('components.nameSegment.nameID.placeholder')}
                  required
                />
                <HostSelector name="host" host={host} />
                <FormikAutocomplete
                  name="visibility"
                  values={visibilitySelectOptions}
                  disablePortal={false}
                  disabled={saving}
                />
              </PageContentBlockSeamless>
              <Actions padding={gutters()}>
                <Button onClick={() => setIsManageLicensePlansDialogOpen(true)}>
                  {t('pages.admin.spaces.manageLicensePlans')}
                </Button>
                <FlexSpacer />
                <Button onClick={() => setSettingsModalOpen(false)}>{t('buttons.cancel')}</Button>
                <LoadingButton variant="contained" loading={saving} onClick={() => handleSubmit()} disabled={!isValid}>
                  {t('buttons.save')}
                </LoadingButton>
              </Actions>
            </>
          )}
        </Formik>
      </DialogWithGrid>
      <DialogWithGrid open={isManageLicensePlansDialogOpen} onClose={() => setIsManageLicensePlansDialogOpen(false)}>
        <DialogHeader
          title={t('pages.admin.spaces.manageLicensePlans')}
          onClose={() => setIsManageLicensePlansDialogOpen(false)}
        />
        <DialogContent>
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
        </DialogContent>
      </DialogWithGrid>
    </>
  );
};

export default SpaceListItem;
