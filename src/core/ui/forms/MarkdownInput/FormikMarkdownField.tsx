import { useRef, useMemo, useState, useEffect, useCallback, ChangeEvent, useLayoutEffect } from 'react';

import { useField } from 'formik';
import { useTranslation } from 'react-i18next';
import { FormControl, FormHelperText, InputLabel, InputProps, OutlinedInput, useFormControl } from '@mui/material';

import TranslationKey from '../../../i18n/utils/TranslationKey';
import CharacterCounter from '../characterCounter/CharacterCounter';
import MarkdownInput, { type MarkdownInputRefApi } from './MarkdownInput';
import { CharacterCountContainer, CharacterCountContextProvider } from './CharacterCountContext';

import { gutters } from '../../grid/utils';
import { isMarkdownMaxLengthError } from './MarkdownValidator';
import { error as logError } from '../../../logging/sentry/log';
import { MarkdownTextMaxLength } from '../field-length.constants';
import { useValidationMessageTranslation } from '../../../../domain/shared/i18n/ValidationMessageTranslation';

export const FormikMarkdownField = ({
  name,
  title,
  maxLength,
  placeholder,
  hideImageOptions,
  required = false,
  readOnly = false,
  disabled = false,
  counterDisabled = false,
  temporaryLocation = false,
  helperText: validInputHelperText,
}: MarkdownFieldProps) => {
  const { t } = useTranslation();

  const tErr = useValidationMessageTranslation();

  const validate = () => {
    const characterCount = inputElementRef.current?.value?.length ?? 0;
    const isAboveCharacterLimit = maxLength && characterCount > maxLength;

    if (isAboveCharacterLimit) {
      return isAboveCharacterLimit ? t('forms.validations.maxLength', { max: maxLength }) : undefined;
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

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      helper.setValue(event.target.value);
    },
    [helper]
  );

  const handleBlur = useCallback(() => {
    helper.setTouched(true);
  }, [helper]);

  // Usually store a reference to the child in a Ref, but in this case we need state
  // cause label's presence/position depends on the presence of this ref.
  const [inputElement, setInputElement] = useState<MarkdownInputRefApi | null>(null);

  const inputElementRef = useRef<MarkdownInputRefApi | null>(null);

  const inputRef = useCallback((nextInputElement: MarkdownInputRefApi | null) => {
    inputElementRef.current = nextInputElement;
    setInputElement(nextInputElement);
  }, []);

  const focusInput = () => {
    inputElement?.focus();
  };

  const labelOffset = inputElement?.getLabelOffset();

  return (
    <FormControl required={required} disabled={disabled} error={isError} fullWidth>
      <CharacterCountContextProvider>
        <FilledDetector value={inputElement?.value} />

        {labelOffset && (
          <InputLabel
            sx={{
              ':not(.MuiInputLabel-shrink)': {
                transform: `translate(${labelOffset.x}, ${labelOffset.y}) scale(1)`,
              },
            }}
            onClick={focusInput}
          >
            {title}
          </InputLabel>
        )}

        <OutlinedInput
          inputRef={inputRef}
          multiline
          label={title}
          value={field.value}
          readOnly={readOnly}
          inputComponent={MarkdownInput}
          inputProps={{
            maxLength,
            hideImageOptions,
            temporaryLocation,
            controlsVisible: 'always',
          }}
          placeholder={placeholder}
          sx={{ '&.MuiOutlinedInput-root': { padding: gutters(0.5) } }}
          onBlur={handleBlur}
          onChange={handleChange}
        />

        <CharacterCountContainer>
          {({ characterCount }) => (
            <CharacterCounter count={characterCount} maxLength={maxLength} disabled={counterDisabled || !maxLength}>
              <FormHelperText error={isError}>{helperText}</FormHelperText>
            </CharacterCounter>
          )}
        </CharacterCountContainer>
      </CharacterCountContextProvider>
    </FormControl>
  );
};

export default FormikMarkdownField;

function FilledDetector({ value }: FilledDetectorProps) {
  const formControl = useFormControl();

  useLayoutEffect(() => {
    if (!formControl) {
      throw new Error('Must be wrapped in FormControl');
    }

    const { onFilled, onEmpty } = formControl;

    value ? onFilled() : onEmpty();
  }, [value, formControl]);

  return null;
}

interface FilledDetectorProps {
  value: string | undefined;
}

interface MarkdownFieldProps extends InputProps {
  name: string;
  title: string;

  loading?: boolean; // TODO make use of
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  helperText?: string;
  placeholder?: string;
  counterDisabled?: boolean;
  hideImageOptions?: boolean;
  temporaryLocation?: boolean;
  maxLength?: MarkdownTextMaxLength;
}
