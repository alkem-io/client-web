import { Box, CircularProgress, FormGroup, Switch, SwitchProps } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import GridContainer from '@/core/ui/grid/GridContainer';
import GridItem from '@/core/ui/grid/GridItem';
import { useColumns } from '@/core/ui/grid/GridContext';
import { Caption, CaptionSmall } from '@/core/ui/typography';
import { NotificationOption } from './types/NotificationTypes';
import { NotificationValidationService } from './services/NotificationValidationService';
import { NotificationSwitchTooltip } from './components/NotificationSwitchTooltip';

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
  onChange: (key: keyof T, type: 'inApp' | 'email', newValue: boolean) => void;
};

function DualSwitchSettingsGroup<T extends Record<string, NotificationOption>>({
  options,
  onChange,
}: DualSwitchSettingsGroupProps<T>) {
  const { t } = useTranslation();
  const [itemLoading, setItemLoading] = useState<{ key: keyof T; type: 'inApp' | 'email' } | undefined>();

  const columns = useColumns();

  // Calculate column ratios: 1/6 for in-app, 1/6 for email, 4/6 (2/3) for setting label
  const inAppColumns = Math.round(columns / 6);
  const emailColumns = Math.round(columns / 6);
  const labelColumns = columns - inAppColumns - emailColumns; // Remaining columns for label

  const handleChange = async (key: keyof T, type: 'inApp' | 'email', newValue: boolean) => {
    const option = options[key];
    if (!option) return;

    // Validate the change using the validation service
    if (!NotificationValidationService.isChangeAllowed(option, type, newValue)) {
      return; // Prevent invalid changes
    }

    setItemLoading({ key, type });
    await onChange(key, type, newValue);
    setItemLoading(undefined);
  };

  return (
    <Box>
      {/* Header row with switch labels */}
      <GridContainer disablePadding sx={{ mb: 1, alignItems: 'center' }}>
        <GridItem columns={inAppColumns}>
          <Box sx={{ textAlign: 'center' }}>
            <CaptionSmall>{t('common.inApp')}</CaptionSmall>
          </Box>
        </GridItem>
        <GridItem columns={emailColumns}>
          <Box sx={{ textAlign: 'center' }}>
            <CaptionSmall>{t('common.email')}</CaptionSmall>
          </Box>
        </GridItem>
      </GridContainer>

      <FormGroup>
        {Object.entries(options).map(([key, option]) => {
          const isInAppLoading = itemLoading?.key === key && itemLoading?.type === 'inApp';
          const isEmailLoading = itemLoading?.key === key && itemLoading?.type === 'email';
          const isAnyLoading = Boolean(itemLoading);

          // Calculate switch states using the validation service
          const switchStates = NotificationValidationService.calculateSwitchStates(option);

          return (
            <GridContainer key={key} disablePadding sx={{ alignItems: 'center', py: 0.5 }}>
              <GridItem columns={inAppColumns}>
                <Box sx={{ textAlign: 'center' }}>
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
              </GridItem>
              <GridItem columns={emailColumns}>
                <Box sx={{ textAlign: 'center' }}>
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
              </GridItem>
              <GridItem columns={labelColumns}>
                <Caption
                  color={switchStates.inApp.disabled && switchStates.email.disabled ? 'text.disabled' : 'text.primary'}
                >
                  {option.label}
                </Caption>
              </GridItem>
            </GridContainer>
          );
        })}
      </FormGroup>
    </Box>
  );
}

export default DualSwitchSettingsGroup;
