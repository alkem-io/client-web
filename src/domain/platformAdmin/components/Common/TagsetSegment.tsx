import { FieldArray, useField } from 'formik';
import type React from 'react';
import type { FC } from 'react';
import * as yup from 'yup';
import TagsInput from '@/core/ui/forms/tagsInput/TagsInput';
import { textLengthValidator } from '@/core/ui/forms/validator/textLengthValidator';
import type { TagsetModel } from '@/domain/common/tagset/TagsetModel';
import { toTagsetTitle } from '@/domain/common/tagset/toTagsetTitle';
import useValidationMessageTranslation from '@/domain/shared/i18n/ValidationMessageTranslation/useValidationMessageTranslation';

interface TagsSegmentProps {
  name?: string;
  readOnly?: boolean;
  disabled?: boolean;
  title?: string;
  helpText?: string;
  loading?: boolean;
}

export const tagsetSegmentValidationObject = yup.object().shape({
  name: textLengthValidator(),
  tags: yup.array().of(textLengthValidator({ minLength: 2 })),
});
export const tagsetsSegmentSchema = yup.array().of(tagsetSegmentValidationObject);

export const TagsetSegment: FC<TagsSegmentProps> = ({
  name = 'tagsets',
  readOnly = false,
  disabled,
  title,
  helpText,
  loading,
}) => {
  const [field] = useField(name);
  const tagsets: TagsetModel[] = field.value;

  return (
    <FieldArray name={name}>
      {() =>
        tagsets.map((tagSet, index) => (
          <TagsetField
            key={index}
            name={`${name}[${index}].tags`}
            title={toTagsetTitle(tagSet, title)}
            readOnly={readOnly}
            disabled={disabled}
            helpTextIcon={helpText}
            loading={loading}
          />
        ))
      }
    </FieldArray>
  );
};

interface TagsetFieldProps {
  title: string;
  name: string;
  required?: boolean;
  readOnly?: boolean;
  type?: string;
  placeholder?: string;
  as?: React.ElementType;
  disabled?: boolean;
  helpTextIcon?: string;
  helperText?: string;
  loading?: boolean;
}

export const TagsetField: FC<TagsetFieldProps> = ({
  title,
  name,
  required = false,
  readOnly = false,
  disabled = false,
  placeholder,
  helpTextIcon,
  helperText: _helperText,
  loading,
}) => {
  const [field, meta, helper] = useField(name);
  const translateValidation = useValidationMessageTranslation();

  // Surface validation errors regardless of touched-state — pre-loaded data
  // that fails the `minLength` rule (e.g. legacy 1-char tags created before
  // the constraint existed) needs to be visible immediately, otherwise the
  // SAVE button silently stays disabled with no explanation.
  const isError = Boolean(meta.error);
  const helperText = (() => {
    if (!isError) {
      return _helperText;
    }
    // `textLengthValidator` returns `ValidationMessageWithPayload` objects
    // (`{ key, payload }`) — translate them; fall back to the raw value as
    // a defensive last resort if something pre-stringified it.
    return translateValidation(meta.error as Parameters<typeof translateValidation>[0]) ?? meta.error;
  })();

  return (
    <TagsInput
      name={name}
      label={title}
      variant={'outlined'}
      placeholder={placeholder}
      value={field.value}
      required={required}
      disabled={disabled}
      readOnly={readOnly}
      error={isError}
      helperText={helperText}
      helpTextIcon={helpTextIcon}
      onChange={items => helper.setValue(items)}
      onBlur={field.onBlur}
      fullWidth={true}
      loading={loading}
    />
  );
};
