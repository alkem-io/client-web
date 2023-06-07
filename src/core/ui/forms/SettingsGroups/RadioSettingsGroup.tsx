import { Box, CircularProgress, FormControlLabel, Radio, RadioGroup, RadioProps } from '@mui/material';
import { FC, ReactNode } from 'react';

const LoadingRadio: FC<RadioProps & { loading?: boolean }> = ({ loading, ...props }) => {
  return loading ? (
    <Box position="relative">
      <CircularProgress sx={{ width: '100%', height: '100%', position: 'absolute' }} />
      <Radio {...props} disabled />
    </Box>
  ) : (
    <Radio {...props} />
  );
};

interface RadioSettingsGroupProps<T extends Record<string, { label: ReactNode }>> {
  value: keyof T | undefined;
  options: T;
  loading?: boolean;
  onChange: (t: keyof T) => void;
}

function RadioSettingsGroup<T extends Record<string, { label: ReactNode }>>({
  value,
  options,
  loading,
  onChange,
}: RadioSettingsGroupProps<T>) {
  return (
    <RadioGroup
      value={value}
      onChange={(event, newValue) => {
        const option = options[newValue];
        if (option) {
          onChange(newValue as keyof T);
        }
      }}
    >
      {Object.entries(options).map(([key, option]) => (
        <FormControlLabel value={key} control={<LoadingRadio loading={loading} />} label={option.label} />
      ))}
    </RadioGroup>
  );
}

export default RadioSettingsGroup;
