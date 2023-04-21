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
const availableCalloutTypes = [CalloutType.Comments, CalloutType.Card, CalloutType.Canvas];

export const CalloutTypeSelect: FC<CalloutTypeSelectProps> = ({ value, onSelect, disabled = false }) => {
  const { t } = useTranslation();

  const handleChange = (value: CalloutType | undefined) => {
    onSelect(value);
  };

  return (
    <RadioButtonGroup value={value} disabled={disabled} onChange={handleChange}>
      {availableCalloutTypes.map(calloutType => (
        <RadioButton key={calloutType} value={calloutType} iconComponent={calloutIcons[calloutType]}>
          {t(`components.calloutTypeSelect.label.${calloutType}` as const)}
        </RadioButton>
      ))}
    </RadioButtonGroup>
  );
};

export default CalloutTypeSelect;
