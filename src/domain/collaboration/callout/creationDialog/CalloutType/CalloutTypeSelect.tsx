import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthorizationPrivilege, CalloutType } from '../../../../../core/apollo/generated/graphql-schema';
import calloutIcons from '../../utils/calloutIcons';
import RouterLink from '../../../../../core/ui/link/RouterLink';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Caption } from '../../../../../core/ui/typography';
import { useConfig } from '../../../../platform/config/useConfig';
import { Button } from '@mui/material';
import { useCollaborationAuthorization } from '../../../authorization/useCollaborationAuthorization';

interface CalloutTypeSelectProps {
  onOpenCalloutTemplatesLibrary?: () => void;
  onSelect: (value: CalloutType | undefined) => void;
  disabled?: boolean;
  extraButtons?: React.ReactNode;
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

export const CalloutTypeSelect: FC<CalloutTypeSelectProps> = ({ onSelect, disabled = false, extraButtons }) => {
  const { t } = useTranslation();
  const { locations } = useConfig();
  const { collaborationPrivileges } = useCollaborationAuthorization();

  const handleClick = (value: CalloutType | undefined) => () => {
    onSelect(value);
  };

  return (
    <>
      <>
        {(Object.keys(availableCalloutTypes) as CalloutType[]).map(calloutType => {
          const calloutTypeEnabled = availableCalloutTypes[calloutType];
          if (calloutTypeEnabled(collaborationPrivileges)) {
            const Icon = calloutIcons[calloutType];
            return (
              <Button
                size="large"
                startIcon={<Icon />}
                onClick={handleClick(calloutType)}
                variant="outlined"
                disabled={disabled}
                sx={{ textTransform: 'none', justifyContent: 'start' }}
              >
                {t(`components.calloutTypeSelect.label.${calloutType}` as const)}
              </Button>
            );
          } else {
            return <></>;
          }
        })}
        {extraButtons}
      </>

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
