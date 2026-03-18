import { FormControlLabel, FormGroup, Switch } from '@mui/material';
import { useField } from 'formik';
import { useImperativeHandle, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CalloutAllowedActors } from '@/core/apollo/generated/graphql-schema';
import type { CalloutRestrictions } from '@/domain/collaboration/callout/CalloutRestrictionsTypes';
import type { FramingSettings } from '../CalloutFormContributionSettings';
import type { CalloutFormSubmittedValues } from '../CalloutFormModel';
import type { ContributionTypeSettingsComponentRef } from './ContributionSettingsDialog';

type FieldsState = {
  membersCanRespond: boolean;
  adminCanRespond: boolean;
  commentsOnEachResponse: boolean;
};

const ContributionsSettings = ({
  ref,
  enabledSettings,
  calloutRestrictions,
}: { calloutRestrictions?: CalloutRestrictions; enabledSettings: FramingSettings } & {
  ref?: React.Ref<ContributionTypeSettingsComponentRef>;
}) => {
  const { t } = useTranslation();
  const [field, , meta] = useField<CalloutFormSubmittedValues['settings']>('settings');

  const [formState, setFormState] = useState<FieldsState>({
    membersCanRespond:
      field.value.contribution.enabled && field.value.contribution.canAddContributions === CalloutAllowedActors.Members,
    adminCanRespond:
      field.value.contribution.enabled && field.value.contribution.canAddContributions !== CalloutAllowedActors.None,
    commentsOnEachResponse: calloutRestrictions?.disableCommentsToContributions
      ? false
      : field.value.contribution.commentsEnabled,
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
            ? CalloutAllowedActors.Members
            : formState.adminCanRespond
              ? CalloutAllowedActors.Admins
              : CalloutAllowedActors.None,
          commentsEnabled: calloutRestrictions?.disableCommentsToContributions
            ? false
            : formState.commentsOnEachResponse,
        },
      };
      meta.setValue(newValue);
    },
    isContentChanged: () => {
      return (
        formState.membersCanRespond !==
          (field.value.contribution.canAddContributions === CalloutAllowedActors.Members) ||
        formState.adminCanRespond !== (field.value.contribution.canAddContributions !== CalloutAllowedActors.None) ||
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
              disabled={calloutRestrictions?.disableCommentsToContributions}
            />
          }
          label={t('callout.create.contributionSettings.contributionTypes.settings.commentsOnEachResponse')}
        />
      )}
    </FormGroup>
  );
};

export default ContributionsSettings;
