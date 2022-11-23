import { Box, Checkbox, FormControlLabel, FormControlLabelProps } from '@mui/material';
import { useConfig } from '../../../../hooks';
import translateWithElements from '../../../../domain/shared/i18n/TranslateWithElements/TranslateWithElements';

export interface AcceptTermsCheckboxProps
  extends Omit<FormControlLabelProps, 'value' | 'control' | 'label' | 'onChange'> {
  value: boolean;
  onChange?: (value: boolean) => void;
}

const AcceptTermsCheckbox = ({ value, onChange, ...props }: AcceptTermsCheckboxProps) => {
  const { platform, loading: loadingPlatform } = useConfig();

  if (loadingPlatform) {
    return null;
  }

  const tTerms = translateWithElements(<a target="_blank" />); // eslint-skip jsx-a11y/anchor-has-content, jsx-a11y/anchor-is-valid
  const label = tTerms('pages.registration.terms', {
    terms: {
      href: platform!.terms,
    },
    privacy: {
      href: platform!.privacy,
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
