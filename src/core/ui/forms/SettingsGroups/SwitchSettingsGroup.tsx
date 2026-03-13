import { Box, CircularProgress, FormControlLabel, FormGroup, Switch, type SwitchProps } from '@mui/material';
import { type ReactNode, useState } from 'react';

const LoadingSwitch = ({ loading, ...props }: SwitchProps & { loading?: boolean }) =>
  loading ? (
    <Box position="relative" aria-busy="true" aria-live="polite">
      <CircularProgress sx={{ width: '100%', height: '100%', position: 'absolute' }} aria-label="Saving changes" />
      <Switch {...props} disabled={true} />
    </Box>
  ) : (
    <Switch {...props} />
  );

type SwitchSettingsGroupProps<T extends Record<string, { checked: boolean; label: ReactNode; disabled?: boolean }>> = {
  options: T;
  onChange: (key: keyof T, newValue: boolean) => void;
  ariaLabel?: string;
};

function SwitchSettingsGroup<T extends Record<string, { checked: boolean; label: ReactNode; disabled?: boolean }>>({
  options,
  onChange,
  ariaLabel,
}: SwitchSettingsGroupProps<T>) {
  const [itemLoading, setItemLoading] = useState<keyof T | undefined>();
  const handleChange = async (key: keyof T, newValue: boolean) => {
    const option = options[key];
    if (option) {
      setItemLoading(key);
      await onChange(key, newValue);
      setItemLoading(undefined);
    }
  };

  return (
    <FormGroup role="group" aria-label={ariaLabel}>
      {Object.entries(options).map(([key, option]) => {
        return (
          <FormControlLabel
            key={key}
            value={key}
            control={
              <LoadingSwitch
                checked={option.checked}
                loading={itemLoading === key}
                disabled={Boolean(itemLoading)}
                onChange={(_event, newValue) => handleChange(key, newValue)}
                inputProps={{
                  'aria-label': typeof option.label === 'string' ? option.label : String(key),
                }}
              />
            }
            label={option.label}
            disabled={option.disabled ?? false}
          />
        );
      })}
    </FormGroup>
  );
}

export default SwitchSettingsGroup;
