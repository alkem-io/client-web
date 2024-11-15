import { Box, Checkbox, FormControlLabel, FormControlLabelProps } from '@mui/material';
import { useConfig } from '@/domain/platform/config/useConfig';
import translateWithElements from '@/domain/shared/i18n/TranslateWithElements/TranslateWithElements';

export interface AcceptTermsCheckboxProps
  extends Omit<FormControlLabelProps, 'value' | 'control' | 'label' | 'onChange'> {
  value: boolean;
  onChange?: (value: boolean) => void;
}

const AcceptTermsCheckbox = ({ value, onChange, ...props }: AcceptTermsCheckboxProps) => {
  const { locations } = useConfig();
  // eslint-disable-next-line jsx-a11y/anchor-has-content, jsx-a11y/anchor-is-valid
  const tTerms = translateWithElements(<a target="_blank" />);
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
      onChange={(event, nextValue) => onChange?.(nextValue)}
      control={<Checkbox />}
      label={<Box>{label}</Box>}
      disableTypography
      sx={{ fontSize: 15 }}
      {...props}
    />
  );
};

export default AcceptTermsCheckbox;
