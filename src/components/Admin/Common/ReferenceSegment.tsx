import { FieldArray } from 'formik';
import React, { FC, useState } from 'react';
import { Col, Form, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { Reference } from '../../../models/Profile';
import Button from '../../core/Button';
import Typography from '../../core/Typography';
import FormikInputField from './FormikInputField';

export interface ReferenceSegmentProps {
  references: Reference[];
  readOnly?: boolean;
  disabled?: boolean;
  onAdd?: (push: (obj: any) => void) => void;
  onRemove?: (ref: Reference, remove: (success: boolean) => void) => void;
}

export const referenceSegmentSchema = yup.array().of(
  yup.object().shape({
    name: yup.string(),
    uri: yup.string(),
  })
);

export const ReferenceSegment: FC<ReferenceSegmentProps> = ({
  references,
  readOnly = false,
  disabled = false,
  onAdd,
  onRemove,
}) => {
  const { t } = useTranslation();
  const [removing, setRemoving] = useState<number | undefined>();
  const [adding, setAdding] = useState(false);

  const handleAdd = (push: (obj: any) => void) => {
    if (onAdd) {
      setAdding(true);
      return onAdd((obj?: any) => {
        if (obj) push(obj);
        setAdding(false);
      });
    }
    push({ name: '', uri: '' });
  };

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
                <Button
                  type={'button'}
                  onClick={e => {
                    e.preventDefault();
                    handleAdd(push);
                  }}
                  disabled={disabled || adding}
                >
                  +
                </Button>
              </OverlayTrigger>
            </Form.Group>
          </Form.Row>
          {references?.length === 0 ? (
            <Form.Row className={'mb-2'}>
              <Form.Control
                type={'text'}
                placeholder={t('components.referenceSegment.missing-refreneces')}
                readOnly={true}
                disabled={true}
              />
            </Form.Row>
          ) : (
            references?.map((ref, index) => (
              <Form.Row key={index} className={'align-items-sm-end'}>
                <Form.Group as={Col} xs={4}>
                  <FormikInputField
                    name={`references.${index}.name`}
                    title={'Name'}
                    readOnly={readOnly}
                    disabled={disabled || index === removing}
                  />
                </Form.Group>
                <Form.Group as={Col}>
                  <FormikInputField
                    name={`references.${index}.uri`}
                    title={'URI'}
                    readOnly={readOnly}
                    disabled={disabled || index === removing}
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
                        type={'button'}
                        onClick={e => {
                          e.preventDefault();
                          if (onRemove) {
                            setRemoving(index);
                            onRemove(ref, (success: boolean) => {
                              if (success) remove(index);
                              setRemoving(undefined);
                            });
                          } else {
                            remove(index);
                          }
                        }}
                        variant={'negative'}
                        disabled={disabled || index === removing}
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
