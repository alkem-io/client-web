import { Box, Checkbox, FormControlLabel } from '@mui/material';
import { useHasAcceptedTerms, useSetHasAcceptedTerms } from './AcceptTermsContext';
import { useConfig } from '../../../../hooks';
import translateWithElements from '../../../../domain/shared/i18n/TranslateWithElements/TranslateWithElements';
//
// interface AcceptTermsCheckboxProps {
//   value: boolean;
//   onChange: (value: boolean) => void;
// }

const AcceptTermsCheckbox = (/*{ value, onChange }: AcceptTermsCheckboxProps*/) => {
  const hasAcceptedTerms = useHasAcceptedTerms();
  const setHasAcceptedTerms = useSetHasAcceptedTerms();

  const { platform, loading: loadingPlatform } = useConfig();

  if (loadingPlatform) {
    return null;
  }

  // eslint-skip-next-line jsx-a11y/anchor-has-content, jsx-a11y/anchor-is-valid
  const tTerms = translateWithElements(<a target="_blank" />);
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
      value={hasAcceptedTerms}
      onChange={(event, nextValue) => setHasAcceptedTerms?.(nextValue)}
      control={<Checkbox />}
      label={<Box>{label}</Box>}
      disableTypography
      sx={{ fontSize: 15 }}
    />
  );
};

export default AcceptTermsCheckbox;
