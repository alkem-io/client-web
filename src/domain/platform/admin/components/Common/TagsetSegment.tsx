import { FieldArray, useField } from 'formik';
import React, { FC, useCallback, useMemo } from 'react';
import * as yup from 'yup';
import { TagsetTemplate } from '../../../../../core/apollo/generated/graphql-schema';
import { Tagset } from '../../../../common/profile/Profile';
import { toTagsetTitle } from '../../../../common/tags/toTagsetTitle';
import TagsInput from '../../../../../core/ui/forms/tagsInput/TagsInput';

interface TagsSegmentProps {
  fieldName?: string;
  tagsets: Tagset[];
  template?: TagsetTemplate[];
  readOnly?: boolean;
  disabled?: boolean;
  title?: string;
  helpText?: string;
  loading?: boolean;
}

const DEFAULT_PLACEHOLDER = 'Innovation, AI, Technology, Blockchain';
export const tagsetSegmentValidationObject = yup.object().shape({
  name: yup.string(),
  tags: yup.array().of(yup.string().min(2)),
});
export const tagsetsSegmentSchema = yup.array().of(tagsetSegmentValidationObject);

export const TagsetSegment: FC<TagsSegmentProps> = ({
  fieldName = 'tagsets',
  tagsets,
  readOnly = false,
  template,
  disabled,
  title,
  helpText,
  loading,
}) => {
  const getTagsetPlaceholder = useCallback(() => {
    //toDo check with Neil why the placeholder was removed so I am just going to pass the default placeholder...
    return DEFAULT_PLACEHOLDER;
  }, [template]);

  return (
    <FieldArray name={fieldName}>
      {() =>
        tagsets.map((tagSet, index) => (
          <TagsetField
            key={index}
            name={`${fieldName}[${index}].tags`}
            title={toTagsetTitle(tagSet, title)}
            placeholder={getTagsetPlaceholder()}
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
