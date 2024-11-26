import { Box, CircularProgress, FormControlLabel, FormGroup, Switch, SwitchProps } from '@mui/material';
import { ReactNode, useState } from 'react';

const LoadingSwitch = ({ loading, ...props }: SwitchProps & { loading?: boolean }) =>
  loading ? (
    <Box position="relative">
      <CircularProgress sx={{ width: '100%', height: '100%', position: 'absolute' }} />
      <Switch {...props} />
    </Box>
  ) : (
    <Switch {...props} />
  );

type SwitchSettingsGroupProps<T extends Record<string, { checked: boolean; label: ReactNode; disabled?: boolean }>> = {
  options: T;
  onChange: (key: keyof T, newValue: boolean) => void;
};

function SwitchSettingsGroup<T extends Record<string, { checked: boolean; label: ReactNode; disabled?: boolean }>>({
  options,
  onChange,
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
    <FormGroup>
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
                onChange={(event, newValue) => handleChange(key, newValue)}
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
