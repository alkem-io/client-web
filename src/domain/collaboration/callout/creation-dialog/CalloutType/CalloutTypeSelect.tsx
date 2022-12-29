import React, { FC } from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useField } from 'formik';
import { CalloutType } from '../../../../../core/apollo/generated/graphql-schema';
import RadioButtonGroup from '../../../../shared/components/RadioButtons/RadioButtonGroup';
import RadioButton from '../../../../shared/components/RadioButtons/RadioButton';
import calloutIcons from '../../utils/calloutIcons';

interface CalloutTypeSelectProps {
  name: string;
  disabled?: boolean;
}

export const CalloutTypeSelect: FC<CalloutTypeSelectProps> = ({ name, disabled = false }) => {
  const [field, , helpers] = useField(name);
  const { t } = useTranslation();

  return (
    <>
      {/* TODO: Add this color to pallete to match Formik labels */}
      <Typography sx={{ color: '#00000099' }}>{t('components.callout-creation.callout-type-label')}</Typography>
      <Box p={1} />
      <RadioButtonGroup value={field.value} disabled={disabled} onChange={helpers.setValue}>
        <RadioButton
          key={CalloutType.Comments}
          value={CalloutType.Comments}
          iconComponent={calloutIcons[CalloutType.Comments]}
        >
          {t('common.discussion')}
        </RadioButton>
        <RadioButton key={CalloutType.Card} value={CalloutType.Card} iconComponent={calloutIcons[CalloutType.Card]}>
          {t('common.cards')}
        </RadioButton>
        <RadioButton
          key={CalloutType.Canvas}
          value={CalloutType.Canvas}
          iconComponent={calloutIcons[CalloutType.Canvas]}
        >
          {t('common.canvases')}
        </RadioButton>
      </RadioButtonGroup>
    </>
  );
};

export default CalloutTypeSelect;
