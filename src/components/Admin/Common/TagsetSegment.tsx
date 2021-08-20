import { Grid } from '@material-ui/core';
import { FieldArray, useField } from 'formik';
import React, { FC, useCallback } from 'react';
import * as yup from 'yup';
import { TagsetTemplate } from '../../../models/graphql-schema';
import { Tagset } from '../../../models/Profile';
import { toFirstCaptitalLetter } from '../../../utils/toFirstCapitalLeter';
import { TagsInput } from '../../core';

import useProfileStyles from './useProfileStyles';

interface TagsSegmentProps {
  tagsets: Tagset[];
  template?: TagsetTemplate[];
  readOnly?: boolean;
  disabled?: boolean;
}

const DEFAULT_PLACEHOLDER = 'Innovation, AI, Technology, Blockchain';
export const tagsetSegmentSchema = yup.array().of(
  yup.object().shape({
    name: yup.string(),
    tags: yup.array().of(yup.string()),
  })
);

export const TagsetSegment: FC<TagsSegmentProps> = ({ tagsets, readOnly = false, template, disabled }) => {
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
            title={toFirstCaptitalLetter(tagSet.name)}
            placeholder={getTagsetPlaceholder(tagSet.name)}
            readOnly={readOnly}
            disabled={disabled}
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
}

export const TagsetField: FC<TagsetFieldProps> = ({
  title,
  name,
  required = false,
  readOnly = false,
  disabled = false,
  placeholder,
}) => {
  const styles = useProfileStyles();
  const [field, , helper] = useField(name);
  return (
    <Grid item xs={12}>
      <TagsInput
        name={name}
        label={title}
        variant={'outlined'}
        placeholder={placeholder}
        value={field.value}
        className={styles.field}
        required={required}
        disabled={disabled}
        onTagsChange={items => {
          helper.setValue(items);
        }}
        InputProps={{
          readOnly,
        }}
        InputLabelProps={{
          shrink: true,
        }}
        fullWidth
      />
    </Grid>
  );
};
