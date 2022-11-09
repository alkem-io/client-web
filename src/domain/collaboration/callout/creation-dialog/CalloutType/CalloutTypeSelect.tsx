import React, { FC } from 'react';
import { Box, Typography } from '@mui/material';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import BallotOutlinedIcon from '@mui/icons-material/BallotOutlined';
import ModeOutlinedIcon from '@mui/icons-material/ModeOutlined';
import { useTranslation } from 'react-i18next';
import { useField } from 'formik';
import { CalloutType } from '../../../../../models/graphql-schema';
import RadioButtonGroup from '../../../../shared/components/RadioButtons/RadioButtonGroup';
import RadioButton from '../../../../shared/components/RadioButtons/RadioButton';

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
        <RadioButton key={CalloutType.Comments} value={CalloutType.Comments} iconComponent={ForumOutlinedIcon}>
          {t('common.discussion')}
        </RadioButton>
        <RadioButton key={CalloutType.Card} value={CalloutType.Card} iconComponent={BallotOutlinedIcon}>
          {t('common.cards')}
        </RadioButton>
        <RadioButton key={CalloutType.Canvas} value={CalloutType.Canvas} iconComponent={ModeOutlinedIcon}>
          {t('common.canvases')}
        </RadioButton>
      </RadioButtonGroup>
    </>
  );
};

export default CalloutTypeSelect;
