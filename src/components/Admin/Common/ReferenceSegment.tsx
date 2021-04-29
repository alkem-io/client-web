import { FieldArray } from 'formik';
import React, { FC } from 'react';
import { Col, Form, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Reference } from '../../../models/Profile';
import InputField from './InputField';
import * as yup from 'yup';
import Button from '../../core/Button';
import Typography from '../../core/Typography';
import { useTranslation } from 'react-i18next';

interface ReferenceSegmentProps {
  references: Reference[];
  readOnly?: boolean;
  disabled?: boolean;
}

export const referenceSchemaFragment = yup.array().of(
  yup.object().shape({
    name: yup.string(),
    uri: yup.string(),
  })
);

export const ReferenceSegment: FC<ReferenceSegmentProps> = ({ references, readOnly = false, disabled = false }) => {
  const { t } = useTranslation();

  return (
    <FieldArray name={'references'}>
      {({ push, remove }) => (
        <>
          <Form.Row>
            <Form.Group as={Col} xs={11} className={'d-flex mb-4 align-items-center'}>
              <Typography variant={'h4'} color={'primary'}>
                {t('components.referenceSegment.title')}
              </Typography>
            </Form.Group>
            <Form.Group as={Col} className={'d-flex flex-row-reverse'}>
              <OverlayTrigger
                overlay={
                  <Tooltip id={'Add a reference'} placement={'bottom'}>
                    {t('components.referenceSegment.tooltips.add-reference')}
                  </Tooltip>
                }
              >
                <Button onClick={() => push({ name: '', uri: '' })} disabled={disabled}>
                  +
                </Button>
              </OverlayTrigger>
            </Form.Group>
          </Form.Row>
          {references?.length === 0 ? (
            <Form.Control type={'text'} placeholder={'No references yet'} readOnly={true} disabled={true} />
          ) : (
            references?.map((ref, index) => (
              <Form.Row key={index} className={'align-items-sm-end'}>
                <Form.Group as={Col} xs={4}>
                  <InputField
                    name={`references.${index}.name`}
                    title={'Name'}
                    value={references[index].name}
                    readOnly={readOnly}
                    disabled={disabled}
                  />
                </Form.Group>
                <Form.Group as={Col}>
                  <InputField
                    name={`references.${index}.uri`}
                    title={'URI'}
                    value={references[index].uri}
                    readOnly={readOnly}
                    disabled={disabled}
                  />
                </Form.Group>
                {!readOnly && (
                  <Form.Group as={Col} xs={1} className={'d-flex flex-row-reverse align-items-end'}>
                    <OverlayTrigger
                      overlay={
                        <Tooltip id={'remove a reference'} placement={'bottom'}>
                          {t('components.referenceSegment.tooltips.remove-reference')}
                        </Tooltip>
                      }
                    >
                      <Button
                        onClick={() => {
                          remove(index);
                        }}
                        variant={'negative'}
                        disabled={disabled}
                      >
                        -
                      </Button>
                    </OverlayTrigger>
                  </Form.Group>
                )}
              </Form.Row>
            ))
          )}
        </>
      )}
    </FieldArray>
  );
};
export default ReferenceSegment;
