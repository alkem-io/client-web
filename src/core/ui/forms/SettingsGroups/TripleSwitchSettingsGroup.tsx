import { Box, CircularProgress, FormGroup, Switch, type SwitchProps } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Caption, CaptionSmall } from '@/core/ui/typography';
import { useInAppNotificationsContext } from '@/main/inAppNotifications/InAppNotificationsContext';
import { NotificationSwitchTooltip } from './components/NotificationSwitchTooltip';
import { NotificationValidationService } from './services/NotificationValidationService';
import type { ChannelType, NotificationOption } from './types/NotificationTypes';

const LoadingSwitch = ({ loading, ...props }: SwitchProps & { loading?: boolean }) =>
  loading ? (
    <Box position="relative">
      <CircularProgress sx={{ width: '100%', height: '100%', position: 'absolute' }} />
      <Switch {...props} />
    </Box>
  ) : (
    <Switch {...props} />
  );

type TripleSwitchSettingsGroupProps<T extends Record<string, NotificationOption>> = {
  options: T;
  onChange: (key: keyof T, type: ChannelType, newValue: boolean) => void | Promise<void>;
  isPushEnabled: boolean;
  isPushAvailable: boolean;
};

function TripleSwitchSettingsGroup<T extends Record<string, NotificationOption>>({
  options,
  onChange,
  isPushEnabled,
  isPushAvailable,
}: TripleSwitchSettingsGroupProps<T>) {
  const { t } = useTranslation();
  const { isEnabled: isInAppNotificationsEnabled } = useInAppNotificationsContext();
  const [itemLoading, setItemLoading] = useState<{ key: keyof T; type: ChannelType } | undefined>();

  const handleChange = async (key: keyof T, type: ChannelType, newValue: boolean) => {
    const option = options[key];
    if (!option) return;

    if (!NotificationValidationService.isChangeAllowed(option, type, newValue)) {
      return;
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
      <Box sx={{ display: 'flex', mb: 1, alignItems: 'center' }}>
        {isInAppNotificationsEnabled && (
          <Box sx={{ width: 60, textAlign: 'center' }}>
            <CaptionSmall>{t('common.inApp')}</CaptionSmall>
          </Box>
        )}
        <Box sx={{ width: 60, textAlign: 'center' }}>
          <CaptionSmall>{t('common.email')}</CaptionSmall>
        </Box>
        {isPushAvailable && (
          <Box sx={{ width: 60, textAlign: 'center' }}>
            <CaptionSmall>{t('common.push')}</CaptionSmall>
          </Box>
        )}
        <Box sx={{ flex: 1 }} />
      </Box>

      <FormGroup>
        {(Object.keys(options) as Array<keyof T>).map(key => {
          const option = options[key];
          const isInAppLoading = itemLoading?.key === key && itemLoading?.type === 'inApp';
          const isEmailLoading = itemLoading?.key === key && itemLoading?.type === 'email';
          const isPushLoading = itemLoading?.key === key && itemLoading?.type === 'push';
          const isAnyLoading = Boolean(itemLoading);

          const switchStates = NotificationValidationService.calculateSwitchStates(option, {
            isPushEnabled,
            isPushAvailable,
          });

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
                      onChange={(_event, newValue) => handleChange(key, 'inApp', newValue)}
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
                    onChange={(_event, newValue) => handleChange(key, 'email', newValue)}
                    size="small"
                  />
                </NotificationSwitchTooltip>
              </Box>
              {isPushAvailable && (
                <Box sx={{ width: 60, textAlign: 'center' }}>
                  <NotificationSwitchTooltip
                    message={switchStates.push.tooltipMessage}
                    show={switchStates.push.disabled}
                  >
                    <LoadingSwitch
                      checked={option.pushChecked}
                      loading={isPushLoading}
                      disabled={switchStates.push.disabled || isAnyLoading}
                      onChange={(_event, newValue) => handleChange(key, 'push', newValue)}
                      size="small"
                      aria-label={`Push notification toggle for ${String(key)}`}
                    />
                  </NotificationSwitchTooltip>
                </Box>
              )}
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

export default TripleSwitchSettingsGroup;
