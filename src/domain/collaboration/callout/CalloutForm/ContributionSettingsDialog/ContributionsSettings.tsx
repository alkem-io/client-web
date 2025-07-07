import { FormControlLabel, FormGroup, Switch } from '@mui/material';
import { useField } from 'formik';
import { CalloutFormSubmittedValues } from '../CalloutFormModel';
import { forwardRef, useImperativeHandle, useState } from 'react';
import { CalloutAllowedContributors } from '@/core/apollo/generated/graphql-schema';
import { ContributionTypeSettingsComponentRef } from './ContributionSettingsDialog';
import { useTranslation } from 'react-i18next';
import { FramingSettings } from '../CalloutFormContributionSettings';
import { CalloutRestrictions } from '@/domain/collaboration/callout/CalloutRestrictionsTypes';

type FieldsState = {
  membersCanRespond: boolean;
  adminCanRespond: boolean;
  commentsOnEachResponse: boolean;
};

const ContributionsSettings = forwardRef<
  ContributionTypeSettingsComponentRef,
  { calloutRestrictions?: CalloutRestrictions; enabledSettings: FramingSettings }
>(({ enabledSettings }, ref) => {
  const { t } = useTranslation();
  const [field, , meta] = useField<CalloutFormSubmittedValues['settings']>('settings');

  const [formState, setFormState] = useState<FieldsState>({
    membersCanRespond: field.value.contribution.canAddContributions === CalloutAllowedContributors.Members,
    adminCanRespond: field.value.contribution.canAddContributions !== CalloutAllowedContributors.None,
    commentsOnEachResponse: field.value.contribution.commentsEnabled,
  });

  const handleChange = (fieldName: keyof FieldsState, checked: boolean) => {
    const newState = { ...formState, [fieldName]: checked };
    if (fieldName === 'adminCanRespond' && !checked) {
      newState.membersCanRespond = false;
    }
    if (fieldName === 'membersCanRespond' && checked) {
      newState.adminCanRespond = true;
    }
    setFormState(newState);
  };

  useImperativeHandle(ref, () => ({
    onSave: () => {
      const newValue = {
        ...field.value,
        contribution: {
          ...field.value.contribution,
          enabled: formState.membersCanRespond || formState.adminCanRespond,
          canAddContributions: formState.membersCanRespond
            ? CalloutAllowedContributors.Members
            : formState.adminCanRespond
              ? CalloutAllowedContributors.Admins
              : CalloutAllowedContributors.None,
          commentsEnabled: formState.commentsOnEachResponse,
        },
      };
      meta.setValue(newValue);
    },
    isContentChanged: () => {
      return (
        formState.membersCanRespond !==
          (field.value.contribution.canAddContributions === CalloutAllowedContributors.Members) ||
        formState.adminCanRespond !==
          (field.value.contribution.canAddContributions !== CalloutAllowedContributors.None) ||
        formState.commentsOnEachResponse !== field.value.contribution.commentsEnabled
      );
    },
  }));

  return (
    <FormGroup>
      {enabledSettings.canAddContributions && (
        <>
          <FormControlLabel
            control={
              <Switch
                checked={formState.membersCanRespond}
                onChange={(_, checked) => handleChange('membersCanRespond', checked)}
              />
            }
            label={t('callout.create.contributionSettings.contributionTypes.settings.membersCanRespond')}
          />
          <FormControlLabel
            control={
              <Switch
                checked={formState.adminCanRespond}
                onChange={(_, checked) => handleChange('adminCanRespond', checked)}
              />
            }
            label={t('callout.create.contributionSettings.contributionTypes.settings.adminCanRespond')}
          />
        </>
      )}
      {enabledSettings.commentsEnabled && (
        <FormControlLabel
          control={
            <Switch
              checked={formState.commentsOnEachResponse}
              onChange={(_, checked) => handleChange('commentsOnEachResponse', checked)}
            />
          }
          label={t('callout.create.contributionSettings.contributionTypes.settings.commentsOnEachResponse')}
        />
      )}
    </FormGroup>
  );
});

export default ContributionsSettings;
