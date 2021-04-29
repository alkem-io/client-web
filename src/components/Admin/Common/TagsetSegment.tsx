import { FieldArray, useField } from 'formik';
import React, { FC, useCallback } from 'react';
import { Col, Form } from 'react-bootstrap';
import * as yup from 'yup';
import { Tagset } from '../../../models/Profile';
import { TagsetTemplate } from '../../../types/graphql-schema';
import { toFirstCaptitalLetter } from '../../../utils/toFirstCapitalLeter';

interface TagsSegmentProps {
  tagsets: Tagset[];
  template?: TagsetTemplate[];
  readOnly: boolean;
}

const DEFAULT_PLACEHOLDER = 'Innovation, AI, Technology, Blockchain';
export const tagsetSchemaFragment = yup.array().of(
  yup.object().shape({
    name: yup.string(),
    tags: yup.array().of(yup.string()),
  })
);

export const TagsetSegment: FC<TagsSegmentProps> = ({ tagsets, readOnly, template }) => {
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
            value={tagSet.tags}
            title={toFirstCaptitalLetter(tagSet.name)}
            placeholder={getTagsetPlaceholder(tagSet.name)}
            readOnly={readOnly}
          />
        ))
      }
    </FieldArray>
  );
};

interface TagsetFieldProps {
  title: string;
  value: string[];
  name: string;
  required?: boolean;
  readOnly?: boolean;
  type?: string;
  placeholder?: string;
  as?: React.ElementType;
}

export const TagsetField: FC<TagsetFieldProps> = ({
  title,
  name,
  value,
  required = false,
  readOnly = false,
  placeholder,
}) => {
  const helper = useField(name)[2];
  return (
    <Form.Row>
      <Form.Group as={Col}>
        <Form.Label>{title}</Form.Label>
        <Form.Control
          name={name}
          type={'text'}
          placeholder={placeholder}
          value={value?.join(',')}
          readOnly={readOnly}
          required={required}
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
export default TagsetSegment;
