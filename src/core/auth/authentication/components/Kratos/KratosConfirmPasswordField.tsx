import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import { type FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

type KratosConfirmPasswordFieldProps = {
  value: string;
  onChange: (value: string) => void;
  label: string;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  autoComplete?: string;
  /**
   * Optional `name` attribute for the underlying input. Left unset by
   * default so the field is NOT serialized into the native form POST —
   * the confirm value is purely a client-side UX guardrail and must never
   * reach Kratos.
   */
  name?: string;
};

/**
 * Confirm-password companion for `KratosInput`. Renders an MUI
 * `TextField` styled the same as the password input (outlined, shrunk
 * label, show/hide toggle) so the two inputs visually align inside a
 * Kratos form. The value is held by the consumer and is purely
 * client-side — Kratos does not enforce confirmation, and the field is
 * not submitted with the form.
 */
export const KratosConfirmPasswordField: FC<KratosConfirmPasswordFieldProps> = ({
  value,
  onChange,
  label,
  error,
  helperText,
  disabled,
  autoComplete = 'new-password',
  name,
}) => {
  const { t } = useTranslation();
  const [obscured, setObscured] = useState(true);

  return (
    <TextField
      name={name}
      label={label}
      value={value}
      variant="outlined"
      type={obscured ? 'password' : 'text'}
      error={error}
      helperText={helperText}
      required={true}
      disabled={disabled}
      autoComplete={autoComplete}
      autoCapitalize="off"
      autoCorrect="off"
      fullWidth={true}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              onClick={() => setObscured(prev => !prev)}
              title={obscured ? t('kratos.fields.ShowPassword') : t('kratos.fields.HidePassword')}
              aria-label={obscured ? t('kratos.fields.ShowPassword') : t('kratos.fields.HidePassword')}
              size="small"
            >
              {obscured ? <VisibilityIcon /> : <VisibilityOffIcon />}
            </IconButton>
          </InputAdornment>
        ),
      }}
      InputLabelProps={{ shrink: true }}
      sx={{ marginY: 0.5 }}
      onChange={e => onChange(e.target.value)}
    />
  );
};

export default KratosConfirmPasswordField;
