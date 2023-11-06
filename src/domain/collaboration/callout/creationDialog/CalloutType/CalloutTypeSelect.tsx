import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthorizationPrivilege, CalloutType } from '../../../../../core/apollo/generated/graphql-schema';
import RadioButtonGroup from '../../../../shared/components/RadioButtons/RadioButtonGroup';
import RadioButton from '../../../../shared/components/RadioButtons/RadioButton';
import calloutIcons from '../../utils/calloutIcons';
import RouterLink from '../../../../../core/ui/link/RouterLink';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Caption } from '../../../../../core/ui/typography';
import { useConfig } from '../../../../platform/config/useConfig';
import { useSpace } from '../../../../journey/space/SpaceContext/useSpace';

interface CalloutTypeSelectProps {
  onSelect: (value: CalloutType | undefined) => void;
  value: CalloutType | undefined;
  disabled?: boolean;
}
/**
 * List of callout types and an array of the permissions required to create them
 */
type CalloutTypeEnabledFunction = (privileges: AuthorizationPrivilege[]) => boolean;

const availableCalloutTypes: Record<CalloutType, CalloutTypeEnabledFunction> = {
  [CalloutType.Post]: () => true, // Always visible
  // Show normal Whiteboards if RT whiteboards are disabled, otherwise show only RT whiteboards
  [CalloutType.Whiteboard]: privileges => !privileges.includes(AuthorizationPrivilege.CreateWhiteboardRt),
  [CalloutType.WhiteboardRt]: privileges => privileges.includes(AuthorizationPrivilege.CreateWhiteboardRt),
  // Always visible
  [CalloutType.LinkCollection]: () => true,
  [CalloutType.PostCollection]: () => true,
  [CalloutType.WhiteboardCollection]: () => true,
};

export const CalloutTypeSelect: FC<CalloutTypeSelectProps> = ({ value, onSelect, disabled = false }) => {
  const { t } = useTranslation();
  const { locations } = useConfig();
  const { permissions } = useSpace();

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
        {(Object.keys(availableCalloutTypes) as CalloutType[]).map(calloutType => {
          const calloutTypeEnabled = availableCalloutTypes[calloutType];
          if (calloutTypeEnabled(permissions.collaborationPrivileges)) {
            return (
              <RadioButton key={calloutType} value={calloutType} iconComponent={calloutIcons[calloutType]}>
                {t(`components.calloutTypeSelect.label.${calloutType}` as const)}
              </RadioButton>
            );
          } else {
            return <></>;
          }
        })}
      </RadioButtonGroup>
      {locations?.inspiration && (
        <RouterLink to={locations.inspiration}>
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
