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
const availableCalloutTypes: Record<CalloutType, AuthorizationPrivilege[]> = {
  [CalloutType.Post]: [],
  [CalloutType.Whiteboard]: [],
  [CalloutType.WhiteboardRt]: [AuthorizationPrivilege.CreateWhiteboardRt],
  [CalloutType.LinkCollection]: [],
  [CalloutType.PostCollection]: [],
  [CalloutType.WhiteboardCollection]: [],
};

export const CalloutTypeSelect: FC<CalloutTypeSelectProps> = ({ value, onSelect, disabled = false }) => {
  const { t } = useTranslation();
  const { platform } = useConfig();
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
          const requiredPermissions = availableCalloutTypes[calloutType];
          if (
            requiredPermissions.length === 0 || // No permissions required, calloutType is just Available
            requiredPermissions.every(permission => permissions.collaborationPrivileges.includes(permission))
          ) {
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
