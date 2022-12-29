import { Grid, InputAdornment, OutlinedInputProps, TextField } from '@mui/material';
import { UiNodeInputAttributes } from '@ory/kratos-client';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import React, { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getNodeName, getNodeTitle, getNodeValue, isInvalidNode, isRequired } from './helpers';
import { KratosInputExtraProps, KratosProps } from './KratosProps';
import IconButton from '@mui/material/IconButton';

interface KratosInputProps extends KratosProps, KratosInputExtraProps {}

export const KratosInput: FC<KratosInputProps> = ({ node, autoCapitalize, autoCorrect, autoComplete }) => {
  const { t } = useTranslation();
  const attributes = useMemo(() => node.attributes as UiNodeInputAttributes, [node]);
  const [value, setValue] = useState(getNodeValue(node));
  const [touched, setTouched] = useState(false);
  const [inputType, setInputType] = useState(attributes.type);
  const isPassword = useMemo(() => attributes.type === 'password', [attributes]);

  const invalid = isInvalidNode(node) || (touched && !value);
  const name = getNodeName(node);
  const required = isRequired(node);
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
          <IconButton onClick={() => setInputType(isInputTextObscured ? 'text' : 'password')} size="small">
            {isInputTextObscured ? <VisibilityIcon /> : <VisibilityOffIcon />}
          </IconButton>
        </InputAdornment>
      ),
    };
  }

  return (
    <Grid item xs={12}>
      <TextField
        name={name}
        label={getNodeTitle(node)}
        onBlur={() => setTouched(true)}
        onChange={e => setValue(e.target.value)}
        value={value ? String(value) : ''}
        variant={'outlined'}
        type={inputType}
        error={touched && invalid}
        helperText={helperText}
        required={required}
        disabled={attributes.disabled}
        autoComplete={autoComplete}
        fullWidth
        InputProps={{ ...InputProps }}
        InputLabelProps={{ shrink: true }}
      />
    </Grid>
  );
};

export default KratosInput;
