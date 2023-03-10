import React, { ChangeEvent, FC, useLayoutEffect, useMemo, useRef } from 'react';
import { FormControl, FormHelperText, InputLabel, InputProps, OutlinedInput, useFormControl } from '@mui/material';
import { useField } from 'formik';
import CharacterCounter from '../../../../common/components/composite/common/CharacterCounter/CharacterCounter';
import TranslationKey from '../../../../types/TranslationKey';
import { useValidationMessageTranslation } from '../../../../domain/shared/i18n/ValidationMessageTranslation';
import MarkdownInput, { MarkdownInputRefApi } from './MarkdownInput';
import { CharacterCountContainer, CharacterCountContextProvider } from './CharacterCountContext';

interface MarkdownFieldProps extends InputProps {
  title: string;
  name: string;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
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

  const inputRef = useRef<MarkdownInputRefApi>(null);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <FormControl required={required} disabled={disabled} error={isError} fullWidth>
      <CharacterCountContextProvider>
        <FilledDetector value={field.value} />
        <InputLabel onClick={focusInput}>{title}</InputLabel>
        <OutlinedInput
          value={field.value}
          onChange={handleChange}
          label={title}
          inputComponent={MarkdownInput}
          inputRef={inputRef}
          readOnly={readOnly}
          placeholder={placeholder}
          multiline
        />
        <CharacterCountContainer>
          {({ characterCount }) => (
            <CharacterCounter count={characterCount} maxLength={maxLength} disabled={!withCounter}>
              <FormHelperText error={isError}>{helperText}</FormHelperText>
            </CharacterCounter>
          )}
        </CharacterCountContainer>
      </CharacterCountContextProvider>
    </FormControl>
  );
};

export default FormikMarkdownField;
