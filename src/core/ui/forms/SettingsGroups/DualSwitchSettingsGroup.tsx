import { Box, CircularProgress, FormGroup, Switch, SwitchProps } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Caption, CaptionSmall } from '@/core/ui/typography';
import { NotificationOption } from './types/NotificationTypes';
import { NotificationValidationService } from './services/NotificationValidationService';
import { NotificationSwitchTooltip } from './components/NotificationSwitchTooltip';
import { useInAppNotificationsContext } from '@/main/inAppNotifications/InAppNotificationsContext';

const LoadingSwitch = ({ loading, ...props }: SwitchProps & { loading?: boolean }) =>
  loading ? (
    <Box position="relative">
      <CircularProgress sx={{ width: '100%', height: '100%', position: 'absolute' }} />
      <Switch {...props} />
    </Box>
  ) : (
    <Switch {...props} />
  );

type DualSwitchSettingsGroupProps<T extends Record<string, NotificationOption>> = {
  options: T;
  onChange: (key: keyof T, type: 'inApp' | 'email', newValue: boolean) => void | Promise<void>;
};

function DualSwitchSettingsGroup<T extends Record<string, NotificationOption>>({
  options,
  onChange,
}: DualSwitchSettingsGroupProps<T>) {
  const { t } = useTranslation();
  const { isEnabled: isInAppNotificationsEnabled } = useInAppNotificationsContext();
  const [itemLoading, setItemLoading] = useState<{ key: keyof T; type: 'inApp' | 'email' } | undefined>();

  const handleChange = async (key: keyof T, type: 'inApp' | 'email', newValue: boolean) => {
    const option = options[key];
    if (!option) return;

    // Validate the change using the validation service
    if (!NotificationValidationService.isChangeAllowed(option, type, newValue)) {
      return; // Prevent invalid changes
    }

    setItemLoading({ key, type });
    try {
      await onChange(key, type, newValue);
    } finally {
      setItemLoading(undefined);
    }
  };

  return (
    <Box>
      {/* Header row with switch labels */}
      <Box sx={{ display: 'flex', mb: 1, alignItems: 'center' }}>
        {isInAppNotificationsEnabled && (
          <Box sx={{ width: 60, textAlign: 'center' }}>
            <CaptionSmall>{t('common.inApp')}</CaptionSmall>
          </Box>
        )}
        <Box sx={{ width: 60, textAlign: 'center' }}>
          <CaptionSmall>{t('common.email')}</CaptionSmall>
        </Box>
        <Box sx={{ flex: 1 }}>{/* Empty space for label column header */}</Box>
      </Box>

      <FormGroup>
        {(Object.keys(options) as Array<keyof T>).map(key => {
          const option = options[key];
          const isInAppLoading = itemLoading?.key === key && itemLoading?.type === 'inApp';
          const isEmailLoading = itemLoading?.key === key && itemLoading?.type === 'email';
          const isAnyLoading = Boolean(itemLoading);

          // Calculate switch states using the validation service
          const switchStates = NotificationValidationService.calculateSwitchStates(option);

          return (
            <Box key={String(key)} sx={{ display: 'flex', alignItems: 'center', py: 0.5 }}>
              {isInAppNotificationsEnabled && (
                <Box sx={{ width: 60, textAlign: 'center' }}>
                  <NotificationSwitchTooltip
                    message={switchStates.inApp.tooltipMessage}
                    show={switchStates.inApp.disabled && !switchStates.email.disabled}
                  >
                    <LoadingSwitch
                      checked={option.inAppChecked}
                      loading={isInAppLoading}
                      disabled={switchStates.inApp.disabled || isAnyLoading}
                      onChange={(event, newValue) => handleChange(key, 'inApp', newValue)}
                      size="small"
                    />
                  </NotificationSwitchTooltip>
                </Box>
              )}
              <Box sx={{ width: 60, textAlign: 'center' }}>
                <NotificationSwitchTooltip
                  message={switchStates.email.tooltipMessage}
                  show={switchStates.email.disabled}
                >
                  <LoadingSwitch
                    checked={option.emailChecked}
                    loading={isEmailLoading}
                    disabled={switchStates.email.disabled || isAnyLoading}
                    onChange={(event, newValue) => handleChange(key, 'email', newValue)}
                    size="small"
                  />
                </NotificationSwitchTooltip>
              </Box>
              <Box sx={{ flex: 1, pl: 2 }}>
                <Caption>{option.label}</Caption>
              </Box>
            </Box>
          );
        })}
      </FormGroup>
    </Box>
  );
}

export default DualSwitchSettingsGroup;
