import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { CalloutType } from '../../../../../core/apollo/generated/graphql-schema';
import RadioButtonGroup from '../../../../shared/components/RadioButtons/RadioButtonGroup';
import RadioButton from '../../../../shared/components/RadioButtons/RadioButton';
import calloutIcons from '../../utils/calloutIcons';

interface CalloutTypeSelectProps {
  onSelect: (value: CalloutType | undefined) => void;
  value: CalloutType | undefined;
  disabled?: boolean;
}

export const CalloutTypeSelect: FC<CalloutTypeSelectProps> = ({ value, onSelect, disabled = false }) => {
  const { t } = useTranslation();

  const handleChange = (value: CalloutType | undefined) => {
    onSelect(value);
  };

  return (
    <RadioButtonGroup value={value} disabled={disabled} onChange={handleChange}>
      <RadioButton
        key={CalloutType.Comments}
        value={CalloutType.Comments}
        iconComponent={calloutIcons[CalloutType.Comments]}
      >
        {t('components.callout-creation.callout-type-select.label.post')}
      </RadioButton>
      <RadioButton key={CalloutType.Card} value={CalloutType.Card} iconComponent={calloutIcons[CalloutType.Card]}>
        {t('components.callout-creation.callout-type-select.label.posts')}
      </RadioButton>
      <RadioButton key={CalloutType.Canvas} value={CalloutType.Canvas} iconComponent={calloutIcons[CalloutType.Canvas]}>
        {t('components.callout-creation.callout-type-select.label.whiteboards')}
      </RadioButton>
    </RadioButtonGroup>
  );
};

export default CalloutTypeSelect;
