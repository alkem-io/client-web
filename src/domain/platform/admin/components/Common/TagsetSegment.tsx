import { FieldArray, useField } from 'formik';
import React, { FC, useMemo } from 'react';
import * as yup from 'yup';
import { Tagset } from '../../../../common/profile/Profile';
import { toTagsetTitle } from '../../../../common/tags/toTagsetTitle';
import TagsInput from '@core/ui/forms/tagsInput/TagsInput';

interface TagsSegmentProps {
  fieldName?: string;
  tagsets: Tagset[];
  readOnly?: boolean;
  disabled?: boolean;
  title?: string;
  helpText?: string;
  loading?: boolean;
}

export const tagsetSegmentValidationObject = yup.object().shape({
  name: yup.string(),
  tags: yup.array().of(yup.string().min(2)),
});
export const tagsetsSegmentSchema = yup.array().of(tagsetSegmentValidationObject);

export const TagsetSegment: FC<TagsSegmentProps> = ({
  fieldName = 'tagsets',
  tagsets,
  readOnly = false,
  disabled,
  title,
  helpText,
  loading,
}) => {
  return (
    <FieldArray name={fieldName}>
      {() =>
        tagsets.map((tagSet, index) => (
          <TagsetField
            key={index}
            name={`${fieldName}[${index}].tags`}
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

  const isError = Boolean(meta.error) && meta.touched;
  const helperText = useMemo(() => {
    if (!isError) {
      return _helperText;
    }

    return meta.error;
  }, [isError, meta.error, _helperText]);

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
      fullWidth
      loading={loading}
    />
  );
};
