import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { CalloutType } from '@/core/apollo/generated/graphql-schema';
import calloutIcons from '@/domain/collaboration/callout/utils/calloutIcons';
import RouterLink from '@/core/ui/link/RouterLink';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Caption } from '@/core/ui/typography';
import { useConfig } from '@/domain/platform/config/useConfig';
import { Button } from '@mui/material';

interface CalloutTypeSelectProps {
  onSelect: (value: CalloutType | undefined) => void;
  disabled?: boolean;
  extraButtons?: ReactNode;
  availableCalloutTypes?: CalloutType[];
}

export const AVAILABLE_CALLOUT_TYPES = [
  CalloutType.Post,
  CalloutType.Whiteboard,
  CalloutType.LinkCollection,
  CalloutType.PostCollection,
  CalloutType.WhiteboardCollection,
];

export const CalloutTypeSelect = ({
  onSelect,
  disabled = false,
  extraButtons,
  availableCalloutTypes,
}: CalloutTypeSelectProps) => {
  const { t } = useTranslation();
  const { locations } = useConfig();

  const handleClick = (value: CalloutType | undefined) => () => {
    onSelect(value);
  };

  const availableTypes = availableCalloutTypes ?? AVAILABLE_CALLOUT_TYPES;

  return (
    <>
      <>
        {availableTypes.map(calloutType => {
          const Icon = calloutIcons[calloutType];

          return (
            <Button
              key={calloutType}
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
