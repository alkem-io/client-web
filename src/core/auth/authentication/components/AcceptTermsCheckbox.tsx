import { Checkbox, FormControlLabel } from '@mui/material';
import { useHasAcceptedTerms, useSetHasAcceptedTerms } from './AcceptTermsContext';
//
// interface AcceptTermsCheckboxProps {
//   value: boolean;
//   onChange: (value: boolean) => void;
// }

const AcceptTermsCheckbox = (/*{ value, onChange }: AcceptTermsCheckboxProps*/) => {
  const hasAcceptedTerms = useHasAcceptedTerms();
  const setHasAcceptedTerms = useSetHasAcceptedTerms();

  return (
    <FormControlLabel
      value={hasAcceptedTerms}
      onChange={(event, nextValue) => setHasAcceptedTerms?.(nextValue)}
      control={<Checkbox />}
      label="I accept the Terms of Use and Privacy Policy."
      disableTypography
      sx={{ fontSize: 15 }}
    />
  );
};

export default AcceptTermsCheckbox;
