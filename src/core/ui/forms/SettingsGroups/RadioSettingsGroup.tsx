import { Box, CircularProgress, FormControlLabel, Radio, RadioGroup, RadioProps } from '@mui/material';
import { FC, ReactNode, useState } from 'react';

const LoadingRadio: FC<RadioProps & { loading?: boolean }> = ({ loading, ...props }) => {
  return loading ? (
    <Box position="relative">
      <CircularProgress sx={{ width: '100%', height: '100%', position: 'absolute' }} />
      <Radio {...props} />
    </Box>
  ) : (
    <Radio {...props} />
  );
};

interface RadioSettingsGroupProps<T extends Record<string, { label: ReactNode }>> {
  value: keyof T | undefined;
  options: T;
  onChange: (t: keyof T) => Promise<void> | void;
}

function RadioSettingsGroup<T extends Record<string, { label: ReactNode }>>({
  value,
  options,
  onChange,
}: RadioSettingsGroupProps<T>) {
  const [itemLoading, setItemLoading] = useState<keyof T | undefined>();

  return (
    <RadioGroup
      value={value}
      onChange={async (event, newValue) => {
        const option = options[newValue];
        if (option) {
          setItemLoading(newValue);
          await onChange(newValue);
          setItemLoading(undefined);
        }
      }}
    >
      {Object.entries(options).map(([key, option]) => (
        <FormControlLabel
          key={key}
          value={key}
          control={<LoadingRadio loading={itemLoading === key} disabled={Boolean(itemLoading)} />}
          label={option.label}
        />
      ))}
    </RadioGroup>
  );
}

export default RadioSettingsGroup;
