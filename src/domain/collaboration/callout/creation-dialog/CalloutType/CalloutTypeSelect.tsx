import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CalloutType } from '../../../../../core/apollo/generated/graphql-schema';
import RadioButtonGroup from '../../../../shared/components/RadioButtons/RadioButtonGroup';
import RadioButton from '../../../../shared/components/RadioButtons/RadioButton';
import calloutIcons from '../../utils/calloutIcons';

interface CalloutTypeSelectProps {
  onSelect: (value: CalloutType | undefined) => void;
  disabled?: boolean;
}

export const CalloutTypeSelect: FC<CalloutTypeSelectProps> = ({ onSelect, disabled = false }) => {
  const [value, setValue] = useState<CalloutType | undefined>(undefined);
  const { t } = useTranslation();

  const handleChange = (value: CalloutType | undefined) => {
    setValue(value);
    onSelect(value);
  };

  return (
    <RadioButtonGroup value={value} disabled={disabled} onChange={handleChange}>
      <RadioButton
        key={CalloutType.Comments}
        value={CalloutType.Comments}
        iconComponent={calloutIcons[CalloutType.Comments]}
      >
        {t('components.callout-creation.callout-type-select.label', { calloutType: t('common.post') })}
      </RadioButton>
      <RadioButton key={CalloutType.Card} value={CalloutType.Card} iconComponent={calloutIcons[CalloutType.Card]}>
        {t('components.callout-creation.callout-type-select.label', { calloutType: t('common.posts') })}
      </RadioButton>
      <RadioButton key={CalloutType.Canvas} value={CalloutType.Canvas} iconComponent={calloutIcons[CalloutType.Canvas]}>
        {t('components.callout-creation.callout-type-select.label', { calloutType: t('common.canvas') })}
      </RadioButton>
    </RadioButtonGroup>
  );
};

export default CalloutTypeSelect;
