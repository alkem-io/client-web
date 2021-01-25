import { FieldArray } from 'formik';
import React, { FC } from 'react';
import { Button, Col, Form } from 'react-bootstrap';
import { Reference } from '../../../models/Profile';
import InputField from './InputField';
import * as yup from 'yup';

interface ReferenceSegmentProps {
  references: Reference[];
  readOnly: boolean;
}

export const referenceSchemaFragment = yup.array().of(
  yup.object().shape({
    name: yup.string(),
    uri: yup.string(),
  })
);

export const ReferenceSegment: FC<ReferenceSegmentProps> = ({ references, readOnly }) => {
  return (
    <FieldArray name={'references'}>
      {({ push, remove }) => (
        <>
          <Form.Row className={'mt-4'}>
            <Form.Group as={Col}>
              <Form.Label>References</Form.Label>
            </Form.Group>
          </Form.Row>
          {readOnly && references?.length === 0 ? (
            <Form.Control type={'text'} placeholder={'No references yet'} readOnly={true} disabled={true} />
          ) : (
            references?.map((ref, index) => (
              <Form.Row key={index} className={'align-items-sm-end'}>
                <InputField
                  name={`references.${index}.name`}
                  title={'Name'}
                  value={references[index].name}
                  readOnly={readOnly}
                />
                <InputField
                  name={`references.${index}.uri`}
                  title={'URI'}
                  value={references[index].uri}
                  readOnly={readOnly}
                />
                {!readOnly && (
                  <Form.Group as={Col} xs={1}>
                    <Button
                      onClick={() => {
                        remove(index);
                      }}
                      variant={'danger'}
                    >
                      Remove
                    </Button>
                  </Form.Group>
                )}
              </Form.Row>
            ))
          )}
          {!readOnly && (
            <Form.Row className={'mt-4'}>
              <Form.Group as={Col}>
                <Button onClick={() => push({ name: '', uri: '' })}>Add Reference</Button>
              </Form.Group>
            </Form.Row>
          )}
        </>
      )}
    </FieldArray>
  );
};
export default ReferenceSegment;
