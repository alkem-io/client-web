import { InputAdornment, OutlinedInputProps, TextField, Tooltip } from '@mui/material';
import { UiNodeInputAttributes } from '@ory/kratos-client';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getNodeName, getNodeTitle, getNodeValue, isInvalidNode, isRequired } from './helpers';
import { KratosInputExtraProps, KratosProps } from './KratosProps';
import IconButton from '@mui/material/IconButton';
import { KRATOS_TRAIT_NAME_FIRST_NAME, KRATOS_TRAIT_NAME_LAST_NAME } from './constants';

interface KratosInputProps extends KratosProps, KratosInputExtraProps {
  disabled?: boolean;
  onValueChange?: (value: string) => void;
}

export const KratosInput: FC<KratosInputProps> = ({
  node,
  autoCapitalize,
  autoCorrect,
  autoComplete,
  disabled,
  onValueChange,
}) => {
  const { t } = useTranslation();
  const attributes = useMemo(() => node.attributes as UiNodeInputAttributes, [node]);
  const [value, setValue] = useState(getNodeValue(node));
  const [touched, setTouched] = useState(false);
  const [inputType, setInputType] = useState(attributes.type);
  const isPassword = useMemo(() => attributes.type === 'password', [attributes]);

  const invalid = isInvalidNode(node) || (touched && !value);
  const name = getNodeName(node);
  const required = isRequired(node);
  const isNameField = name === KRATOS_TRAIT_NAME_FIRST_NAME || name === KRATOS_TRAIT_NAME_LAST_NAME;
  const isInputTextObscured = inputType === 'password';

  let helperText = '';
  if (!value && touched) helperText = t('forms.validations.required') + ' ';
  if (node.messages && node.messages.length > 0) helperText = helperText + node.messages?.map(x => x.text).join(' ');

  let InputProps: Partial<OutlinedInputProps> = {
    autoComplete,
    autoCorrect,
    autoCapitalize,
  };

  if (isPassword) {
    InputProps = {
      ...InputProps,
      endAdornment: (
        <InputAdornment position="end">
          <IconButton
            onClick={() => setInputType(isInputTextObscured ? 'text' : 'password')}
            title={isInputTextObscured ? t('kratos.fields.ShowPassword') : t('kratos.fields.HidePassword')}
            aria-label={isInputTextObscured ? t('kratos.fields.ShowPassword') : t('kratos.fields.HidePassword')}
            size="small"
          >
            {isInputTextObscured ? <VisibilityIcon /> : <VisibilityOffIcon />}
          </IconButton>
        </InputAdornment>
      ),
    };
  }

  return (
    <Tooltip
      title={t('pages.accept-terms.tooltip')}
      arrow
      placement="top"
      disableFocusListener={!disabled}
      disableHoverListener={!disabled}
    >
      <TextField
        name={name}
        label={getNodeTitle(node, t)}
        value={value ? String(value) : ''}
        variant={'outlined'}
        type={inputType}
        error={touched && invalid}
        helperText={helperText}
        required={required}
        disabled={attributes.disabled || disabled}
        autoComplete={autoComplete}
        fullWidth
        InputProps={{ ...InputProps }}
        InputLabelProps={{ shrink: true }}
        inputProps={isNameField ? { minLength: 1 } : undefined}
        sx={{ marginY: inputType === 'hidden' ? 0 : 0.5 }}
        onChange={e => {
          setValue(e.target.value);
          onValueChange?.(e.target.value);
        }}
        onBlur={() => setTouched(true)}
      />
    </Tooltip>
  );
};

export default KratosInput;
