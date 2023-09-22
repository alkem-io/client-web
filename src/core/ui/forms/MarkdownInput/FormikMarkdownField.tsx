import React, { ChangeEvent, FC, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { FormControl, FormHelperText, InputLabel, InputProps, OutlinedInput, useFormControl } from '@mui/material';
import { useField } from 'formik';
import CharacterCounter from '../characterCounter/CharacterCounter';
import TranslationKey from '../../../i18n/utils/TranslationKey';
import { useValidationMessageTranslation } from '../../../../domain/shared/i18n/ValidationMessageTranslation';
import MarkdownInput, { MarkdownInputRefApi } from './MarkdownInput';
import {
  CharacterCountContainer,
  CharacterCountContextProvider,
  CharacterCountContextProviderRefValue,
} from './CharacterCountContext';
import { gutters } from '../../grid/utils';
import { MarkdownTextMaxLength } from '../field-length.constants';
import { error as logError } from '../../../logging/sentry/log';
import { isMarkdownMaxLengthError } from './MarkdownValidator';

interface MarkdownFieldProps extends InputProps {
  title: string;
  name: string;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: MarkdownTextMaxLength;
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

  const validate = () => {
    if (!characterCountRef.current) {
      return undefined;
    }
    const { characterCount } = characterCountRef.current;
    const isAboveCharacterLimit = maxLength && characterCount > maxLength;
    if (isAboveCharacterLimit) {
      return isAboveCharacterLimit ? 'max length reached' : undefined;
    }
  };

  const [field, meta, helper] = useField({
    name,
    validate,
  });

  const isError = Boolean(meta.error) && meta.touched;

  useEffect(() => {
    if (meta.error && isMarkdownMaxLengthError(meta.error)) {
      const { path, max } = meta.error;
      logError(new TypeError(`${path} exceeded the length limit of ${max} chars.`));
    }
  }, [meta.error]);

  const helperText = useMemo(() => {
    if (!isError) {
      return validInputHelperText;
    }
    return tErr(meta.error as TranslationKey, { field: title });
  }, [isError, meta.error, validInputHelperText, tErr, title]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    helper.setValue(event.target.value);
    helper.setTouched(true);
  };

  const handleBlur = () => {
    helper.setTouched(true);
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

  const characterCountRef = useRef<CharacterCountContextProviderRefValue>(null);

  console.log('FormikMarkdownField:render', { error: meta.error, touched: meta.touched });

  return (
    <FormControl required={required} disabled={disabled} error={isError} fullWidth>
      <CharacterCountContextProvider ref={characterCountRef}>
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
          onBlur={handleBlur}
          label={title}
          inputComponent={MarkdownInput}
          inputRef={inputRef}
          inputProps={{
            controlsVisible: 'always',
            maxLength,
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
