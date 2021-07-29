import { FieldArray, useField } from 'formik';
import React, { FC, useCallback } from 'react';
import { Col, Form } from 'react-bootstrap';
import * as yup from 'yup';
import { Tagset } from '../../../models/Profile';
import { TagsetTemplate } from '../../../models/graphql-schema';
import { toFirstCaptitalLetter } from '../../../utils/toFirstCapitalLeter';
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
            displayLabel={tagsets.length > 1} /* display label only if tagsets are more than 1 */
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
  displayLabel?: boolean;
}

export const TagsetField: FC<TagsetFieldProps> = ({
  title,
  name,
  required = false,
  readOnly = false,
  disabled = false,
  displayLabel = true,
  placeholder,
}) => {
  const styles = useProfileStyles();
  const [field, , helper] = useField(name);
  return (
    <Form.Row>
      <Form.Group as={Col}>
        {displayLabel && <Form.Label>{title}</Form.Label>}
        <Form.Control
          name={name}
          type={'text'}
          placeholder={placeholder}
          value={field.value?.join(',')}
          className={styles.field}
          readOnly={readOnly}
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
        />
      </Form.Group>
    </Form.Row>
  );
};
