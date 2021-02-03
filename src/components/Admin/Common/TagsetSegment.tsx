import { FieldArray, useField } from 'formik';
import React, { FC } from 'react';
import { Col, Form } from 'react-bootstrap';
import { Tagset } from '../../../models/Profile';
import * as yup from 'yup';

interface TagsSegmentProps {
  tagsets: Tagset[];
  readOnly: boolean;
}

export const getTagsetName = (name: string) => {
  return name === 'default' ? 'Tags' : `${name.slice(0, 1).toUpperCase()}${name.slice(1)}`;
};

export const tagsetSchemaFragment = yup.array().of(
  yup.object().shape({
    name: yup.string(),
    tags: yup.array().of(yup.string()),
  })
);

export const TagsetSegment: FC<TagsSegmentProps> = ({ tagsets, readOnly }) => {
  return (
    <FieldArray name={'tagsets'}>
      {() =>
        tagsets.map((tagSet, index) => (
          <TagsetField
            key={index}
            name={`tagsets[${index}].tags`}
            value={tagSet.tags}
            title={getTagsetName(tagSet.name)}
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
          placeholder={placeholder || 'innovation, AI, technology, blockchain'}
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
