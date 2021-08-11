import { FieldArray, useField } from 'formik';
import React, { FC, useCallback } from 'react';
import { Col, Form } from 'react-bootstrap';
import * as yup from 'yup';
import { Tagset } from '../../../models/Profile';
import { TagsetTemplate } from '../../../models/graphql-schema';
import { toFirstCaptitalLetter } from '../../../utils/toFirstCapitalLeter';
import useProfileStyles from './useProfileStyles';
import { TextField } from '@material-ui/core';

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
    <Form.Row>
      <Form.Group as={Col}>
        <TextField
          name={name}
          label={title}
          variant={'outlined'}
          placeholder={placeholder}
          value={field.value?.join(',')}
          className={styles.field}
          required={required}
          disabled={disabled}
          onChange={e => {
            const stringValue = e.target.value;
            const tagsetArray = stringValue.split(',');
            helper.setValue(tagsetArray);
          }}
          onBlur={e => {
            const stringValue = e.target.value;
            const tagsetArray = stringValue
              .split(',')
              .map(x => x.trim())
              .filter(x => x);
            helper.setValue(tagsetArray);
          }}
          InputProps={{
            readOnly,
          }}
          InputLabelProps={{
            shrink: true,
          }}
          fullWidth
        />
      </Form.Group>
    </Form.Row>
  );
};
