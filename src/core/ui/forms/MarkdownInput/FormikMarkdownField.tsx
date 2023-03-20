import React, { ChangeEvent, FC, useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { FormControl, FormHelperText, InputLabel, InputProps, OutlinedInput, useFormControl } from '@mui/material';
import { useField } from 'formik';
import CharacterCounter from '../../../../common/components/composite/common/CharacterCounter/CharacterCounter';
import TranslationKey from '../../../../types/TranslationKey';
import { useValidationMessageTranslation } from '../../../../domain/shared/i18n/ValidationMessageTranslation';
import MarkdownInput, { MarkdownInputRefApi } from './MarkdownInput';
import { CharacterCountContainer, CharacterCountContextProvider } from './CharacterCountContext';
import { gutters } from '../../grid/utils';
import { MarkdownFieldMaxLength, TextFieldMaxLength } from '../field-length.constants';

interface MarkdownFieldProps extends InputProps {
  title: string;
  name: string;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: TextFieldMaxLength;
  withCounter?: boolean;
  helperText?: string;
  loading?: boolean; // TODO make use of
}

interface FilledDetectorProps {
  value: string | undefined;
}

const FilledDetector = ({ value }: FilledDetectorProps) => {
  const formControl = useFormControl();

  useLayoutEffect(() => {
    if (!formControl) {
      throw new Error('Must be wrapped in FormControl');
    }
    const { onFilled, onEmpty } = formControl;
    if (value) {
      onFilled();
    } else {
      onEmpty();
    }
  }, [value, formControl]);

  return null;
};

export const FormikMarkdownField: FC<MarkdownFieldProps> = ({
  title,
  name,
  required = false,
  readOnly = false,
  disabled = false,
  placeholder,
  maxLength,
  withCounter = false,
  helperText: validInputHelperText,
}) => {
  const tErr = useValidationMessageTranslation();
  const [field, meta, helper] = useField(name);
  const isError = Boolean(meta.error) && meta.touched;

  const helperText = useMemo(() => {
    if (!isError) {
      return validInputHelperText;
    }
    return tErr(meta.error as TranslationKey, { field: title });
  }, [isError, meta.error, validInputHelperText, tErr, title]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    helper.setValue(event.target.value);
  };

  // Usually store a reference to the child in a Ref, but in this case we need state
  // cause label's presence/position depends on the presence of this ref.
  const [inputElement, setInputElement] = useState<MarkdownInputRefApi | null>(null);

  const inputRef = useCallback((nextInputElement: MarkdownInputRefApi | null) => {
    setInputElement(nextInputElement);
  }, []);

  const focusInput = () => {
    inputElement?.focus();
  };

  const labelOffset = inputElement?.getLabelOffset();

  const estimatedVisibleMaxLength = maxLength && MarkdownFieldMaxLength[maxLength];

  return (
    <FormControl required={required} disabled={disabled} error={isError} fullWidth>
      <CharacterCountContextProvider>
        <FilledDetector value={inputElement?.value} />
        {labelOffset && (
          <InputLabel
            onClick={focusInput}
            sx={{
              ':not(.MuiInputLabel-shrink)': {
                transform: `translate(${labelOffset.x}, ${labelOffset.y}) scale(1)`,
              },
            }}
          >
            {title}
          </InputLabel>
        )}
        <OutlinedInput
          value={field.value}
          onChange={handleChange}
          label={title}
          inputComponent={MarkdownInput}
          inputRef={inputRef}
          inputProps={{
            controlsVisible: 'always',
            maxLength: estimatedVisibleMaxLength,
          }}
          readOnly={readOnly}
          placeholder={placeholder}
          multiline
          sx={{
            '&.MuiOutlinedInput-root': {
              padding: gutters(0.5),
            },
          }}
        />
        <CharacterCountContainer>
          {({ characterCount }) => (
            <CharacterCounter count={characterCount} maxLength={estimatedVisibleMaxLength} disabled={!withCounter}>
              <FormHelperText error={isError}>{helperText}</FormHelperText>
            </CharacterCounter>
          )}
        </CharacterCountContainer>
      </CharacterCountContextProvider>
    </FormControl>
  );
};

export default FormikMarkdownField;
