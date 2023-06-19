import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { CalloutType } from '../../../../../core/apollo/generated/graphql-schema';
import RadioButtonGroup from '../../../../shared/components/RadioButtons/RadioButtonGroup';
import RadioButton from '../../../../shared/components/RadioButtons/RadioButton';
import calloutIcons from '../../utils/calloutIcons';
import RouterLink from '../../../../../core/ui/link/RouterLink';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Caption } from '../../../../../core/ui/typography';
import { useConfig } from '../../../../platform/config/useConfig';

interface CalloutTypeSelectProps {
  onSelect: (value: CalloutType | undefined) => void;
  value: CalloutType | undefined;
  disabled?: boolean;
}
const availableCalloutTypes = [
  CalloutType.Post,
  CalloutType.Whiteboard,
  CalloutType.LinkCollection,
  CalloutType.PostCollection,
  CalloutType.WhiteboardCollection,
];

export const CalloutTypeSelect: FC<CalloutTypeSelectProps> = ({ value, onSelect, disabled = false }) => {
  const { t } = useTranslation();
  const { platform } = useConfig();

  const handleChange = (value: CalloutType | undefined) => {
    onSelect(value);
  };

  return (
    <>
      <RadioButtonGroup
        value={value}
        disabled={disabled}
        onChange={handleChange}
        flexWrap="wrap"
        justifyContent="center"
      >
        {availableCalloutTypes.map(calloutType => (
          <RadioButton key={calloutType} value={calloutType} iconComponent={calloutIcons[calloutType]}>
            {t(`components.calloutTypeSelect.label.${calloutType}` as const)}
          </RadioButton>
        ))}
      </RadioButtonGroup>
      {platform?.inspiration && (
        <RouterLink to={platform.inspiration}>
          <Caption color="primary" textAlign="center">
            <OpenInNewIcon fontSize="small" sx={{ verticalAlign: 'bottom', marginRight: 1 }} />
            {t('callout.alkemio-link')}
          </Caption>
        </RouterLink>
      )}
    </>
  );
};

export default CalloutTypeSelect;
