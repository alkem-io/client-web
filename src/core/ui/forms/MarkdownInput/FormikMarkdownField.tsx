import React, { ChangeEvent, FC, useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { FormControl, FormHelperText, InputLabel, InputProps, OutlinedInput, useFormControl } from '@mui/material';
import { useField } from 'formik';
import CharacterCounter from '../characterCounter/CharacterCounter';
import TranslationKey from '../../../i18n/utils/TranslationKey';
import { useValidationMessageTranslation } from '../../../../domain/shared/i18n/ValidationMessageTranslation';
import MarkdownInput, { MarkdownInputRefApi } from './MarkdownInput';
import { CharacterCountContainer, CharacterCountContextProvider } from './CharacterCountContext';
import { gutters } from '../../grid/utils';
import { MarkdownFieldMaxLength, TextFieldMaxLength } from '../field-length.constants';
import { error as logError } from '../../../logging/sentry/log';
import { isMarkdownMaxLengthError } from './MarkdownValidator';

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
  const onCharacterCountChange = (characterCount: number) => {
    console.log('onCharacterCountChange', characterCount, estimatedVisibleMaxLength);
    if (estimatedVisibleMaxLength && characterCount > estimatedVisibleMaxLength) {
      console.log('setError');
      helper.setError('max length reached');
      console.log('meta2', meta);
    }
  };
  console.log('meta', meta);

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
        <CharacterCountContainer onChange={onCharacterCountChange}>
          {({ characterCount }) => (
            <CharacterCounter count={characterCount} maxLength={estimatedVisibleMaxLength} disabled={!withCounter}>
              <FormHelperText error={isError}>{helperText}</FormHelperText>
            </CharacterCounter>
          )}
        </CharacterCountContainer>
        {isError && <>isError</>}
      </CharacterCountContextProvider>
    </FormControl>
  );
};

export default FormikMarkdownField;
