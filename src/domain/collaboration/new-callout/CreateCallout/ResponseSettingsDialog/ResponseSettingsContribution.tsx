import { FormControlLabel, FormGroup, Switch } from '@mui/material';
import { useField } from 'formik';
import { CalloutFormSubmittedValues } from '../CalloutForm';
import { forwardRef, useImperativeHandle, useState } from 'react';
import { CalloutAllowedContributors } from '../constants';
import { ResponseSettingsComponentRef } from './CalloutFormResponseSettingsDialog';
import { useTranslation } from 'react-i18next';

interface FieldsState {
  membersCanRespond: boolean;
  adminCanRespond: boolean;
  commentsOnEachResponse: boolean;
}

const ResponseSettingsContribution = forwardRef<ResponseSettingsComponentRef>((props, ref) => {
  const { t } = useTranslation();
  const [field, , meta] = useField<CalloutFormSubmittedValues['settings']>('settings');

  const [formState, setFormState] = useState<FieldsState>({
    membersCanRespond: field.value.contribution.canAddContributions === CalloutAllowedContributors.Members,
    adminCanRespond: field.value.contribution.canAddContributions !== CalloutAllowedContributors.None,
    commentsOnEachResponse: field.value.contribution.commentsEnabled,
  });

  const handleChange = (fieldName: keyof FieldsState) => {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      const newState = { ...formState, [fieldName]: event.target.checked };
      setFormState(newState);
    };
  };

  useImperativeHandle(ref, () => ({
    onSave: () => {
      const newValue = {
        ...field.value,
        contribution: {
          ...field.value.contribution,
          canAddContributions: formState.membersCanRespond
            ? CalloutAllowedContributors.Members
            : formState.adminCanRespond
              ? CalloutAllowedContributors.Admin
              : CalloutAllowedContributors.None,
          commentsEnabled: formState.commentsOnEachResponse,
        },
      };
      meta.setValue(newValue);
    },
  }));

  return (
    <FormGroup>
      <FormControlLabel
        control={<Switch checked={formState.membersCanRespond} onChange={() => handleChange('membersCanRespond')} />}
        label={t('callout.create.responseOptions.responseSettings.membersCanRespond')}
      />
      <FormControlLabel
        control={<Switch checked={formState.adminCanRespond} />}
        label={t('callout.create.responseOptions.responseSettings.adminCanRespond')}
      />
      <FormControlLabel
        control={<Switch checked={formState.commentsOnEachResponse} />}
        label={t('callout.create.responseOptions.responseSettings.commentsOnEachResponse')}
      />
    </FormGroup>
  );
});

export default ResponseSettingsContribution;
