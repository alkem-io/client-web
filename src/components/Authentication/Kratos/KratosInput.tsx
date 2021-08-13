import { Grid, InputAdornment, OutlinedInputProps, TextField } from '@material-ui/core';
import { UiNodeInputAttributes } from '@ory/kratos-client';
import { ReactComponent as EyeSlash } from 'bootstrap-icons/icons/eye-slash.svg';
import { ReactComponent as Eye } from 'bootstrap-icons/icons/eye.svg';
import React, { FC, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../../core/Icon';
import IconButton from '../../core/IconButton';
import { KratosUIContext } from '../KratosUI';
import { getNodeName, getNodeTitle, getNodeValue, isInvalidNode, isRequired } from './helpers';
import { KratosInputExtraProps, KratosProps } from './KratosProps';

interface KratosInputProps extends KratosProps, KratosInputExtraProps {}

export const KratosInput: FC<KratosInputProps> = ({ node, autoCapitalize, autoCorrect, autoComplete }) => {
  const { t } = useTranslation();
  const { isHidden } = useContext(KratosUIContext);
  const attributes = useMemo(() => node.attributes as UiNodeInputAttributes, [node]);
  const [value, setValue] = useState(getNodeValue(node));
  const [touched, setTouched] = useState(false);
  const [inputType, setInputType] = useState(attributes.type);
  const isPassword = useMemo(() => attributes.type === 'password', [attributes]);

  const invalid = isInvalidNode(node) || (touched && !value);
  const name = getNodeName(node);
  const required = isRequired(node);

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
          <IconButton onClick={() => setInputType(inputType === 'password' ? 'text' : 'password')}>
            <Icon component={inputType === 'password' ? Eye : EyeSlash} color="inherit" size={'xs'} />
          </IconButton>
        </InputAdornment>
      ),
    };
  }

  return (
    <Grid item xs={12}>
      {!isHidden(node) && (
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
        />
      )}
    </Grid>
  );
};
export default KratosInput;
