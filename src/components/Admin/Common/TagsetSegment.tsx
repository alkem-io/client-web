import { Grid } from '@mui/material';
import { FieldArray, useField } from 'formik';
import React, { FC, useCallback } from 'react';
import * as yup from 'yup';
import { TagsetTemplate } from '../../../models/graphql-schema';
import { Tagset } from '../../../models/Profile';
import { toTagsetTitle } from '../../../utils/toTagsetTitle';
import { TagsInput } from '../../core';

interface TagsSegmentProps {
  tagsets: Tagset[];
  template?: TagsetTemplate[];
  readOnly?: boolean;
  disabled?: boolean;
  title?: string;
  helpText?: string;
}

const DEFAULT_PLACEHOLDER = 'Innovation, AI, Technology, Blockchain';
export const tagsetSegmentValidationObject = yup.object().shape({
  name: yup.string(),
  tags: yup.array().of(yup.string().min(2)),
});
export const tagsetSegmentSchema = yup.array().of(tagsetSegmentValidationObject);

export const TagsetSegment: FC<TagsSegmentProps> = ({
  tagsets,
  readOnly = false,
  template,
  disabled,
  title,
  helpText,
}) => {
  const getTagsetPlaceholder = useCallback(
    (name: string) => {
      if (!template) return DEFAULT_PLACEHOLDER;
      return template.find(x => x.name.toLowerCase() === name.toLowerCase())?.placeholder || DEFAULT_PLACEHOLDER;
    },
    [template]
  );

  return (
    <FieldArray name={'tagsets'}>
      {() =>
        tagsets.map((tagSet, index) => (
          <TagsetField
            key={index}
            name={`tagsets[${index}].tags`}
            title={toTagsetTitle(tagSet, title)}
            placeholder={getTagsetPlaceholder(tagSet.name)}
            readOnly={readOnly}
            disabled={disabled}
            helpText={helpText}
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
  helpText?: string;
}

export const TagsetField: FC<TagsetFieldProps> = ({
  title,
  name,
  required = false,
  readOnly = false,
  disabled = false,
  placeholder,
  helpText,
}) => {
  const [field, meta, helper] = useField(name);
  return (
    <Grid item xs={12}>
      <TagsInput
        name={name}
        label={title}
        variant={'outlined'}
        placeholder={placeholder}
        value={field.value}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        error={Boolean(meta.error)}
        helperText={meta.error}
        helpText={helpText}
        onChange={items => helper.setValue(items)}
        InputLabelProps={{
          shrink: true,
        }}
        fullWidth
      />
    </Grid>
  );
};
