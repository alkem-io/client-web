import { Box, BoxProps, Checkbox, FormControlLabel, FormControlLabelProps } from '@mui/material';
import { useConfig } from '@/domain/platform/config/useConfig';
import translateWithElements from '@/domain/shared/i18n/TranslateWithElements/TranslateWithElements';

export interface AcceptTermsCheckboxProps
  extends Omit<FormControlLabelProps, 'value' | 'control' | 'label' | 'onChange'> {
  value: boolean;
  onChange?: (value: boolean) => void;
}
const Link = (props: BoxProps<'a'>) => {
  return <Box component="a" target="_blank" whiteSpace="nowrap" {...props} />;
};

const AcceptTermsCheckbox = ({ value, onChange, ...props }: AcceptTermsCheckboxProps) => {
  const { locations } = useConfig();
  const tTerms = translateWithElements(<Link sx={{ color: theme => theme.palette.highlight.dark }} />);
  const label = tTerms('pages.registration.terms', {
    terms: {
      href: locations?.terms,
    },
    privacy: {
      href: locations?.privacy,
    },
  });

  return (
    <FormControlLabel
      value={value}
      checked={value}
      onChange={(_event, nextValue) => onChange?.(nextValue)}
      control={<Checkbox />}
      label={<Box sx={{ fontSize: 15, color: theme => theme.palette.neutral.light }}>{label}</Box>}
      disableTypography
      sx={{ fontSize: 15, color: theme => theme.palette.neutral.light, marginBottom: 0 }}
      {...props}
    />
  );
};

export default AcceptTermsCheckbox;
