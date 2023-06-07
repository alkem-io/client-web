import { Box, CircularProgress, FormControlLabel, FormGroup, Switch, SwitchProps } from '@mui/material';
import { FC, ReactNode } from 'react';

const LoadingSwitch: FC<SwitchProps & { loading?: boolean }> = ({ loading, ...props }) => {
  return loading ? (
    <Box position="relative">
      <CircularProgress sx={{ width: '100%', height: '100%', position: 'absolute' }} />
      <Switch {...props} disabled />
    </Box>
  ) : (
    <Switch {...props} />
  );
};

interface SwitchSettingsGroupProps<T extends Record<string, { checked: boolean; label: ReactNode }>> {
  options: T;
  loading?: boolean;
  onChange: (key: keyof T, newValue: boolean) => void;
}

function SwitchSettingsGroup<T extends Record<string, { checked: boolean; label: ReactNode }>>({
  options,
  loading,
  onChange,
}: SwitchSettingsGroupProps<T>) {
  return (
    <FormGroup>
      {Object.entries(options).map(([key, option]) => {
        return (
          <FormControlLabel
            value={key}
            control={
              <LoadingSwitch
                checked={option.checked}
                loading={loading}
                onChange={(event, newValue) => onChange(key, newValue)}
              />
            }
            label={option.label}
          />
        );
      })}
    </FormGroup>
  );
}

export default SwitchSettingsGroup;
