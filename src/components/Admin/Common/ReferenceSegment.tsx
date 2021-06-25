import { FieldArray } from 'formik';
import React, { FC } from 'react';
import { Col, Form, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
// import { useCreateReferenceOnContextMutation, useDeleteReferenceMutation } from '../../../generated/graphql';
import { Reference } from '../../../models/Profile';
import Button from '../../core/Button';
import Typography from '../../core/Typography';
import FormikInputField from './FormikInputField';

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
  // const [addReference] = useCreateReferenceOnContextMutation({
  //   update: (cache, { data }) => {
  //     if (data && community) {
  //       const { createGroupOnCommunity: newGroup } = data;
  //       cache.modify({
  //         id: cache.identify(community),
  //         fields: {
  //           groups(existingGroups = []) {
  //             const newGroupRef = cache.writeFragment({
  //               data: newGroup,
  //               fragment: GroupDetailsFragmentDoc,
  //             });
  //             return [...existingGroups, newGroupRef];
  //           },
  //         },
  //       });
  //     }
  //   },
  // });

  // const [deleteReference] = useDeleteReferenceMutation();
  const handleAdd = () => {
    // addReference({
    //   variables: {
    //     input: {
    //       contextID: '', // TOOD
    //       name: 'New reference',
    //       description: '',
    //       uri: '',
    //     },
    //   },
    //   optimisticResponse: {
    //     createReferenceOnContext: {
    //       __typename: 'Reference',
    //       id: '00000000-0000-0000-0000-000000000000',
    //       name: 'New reference',
    //       description: '',
    //       uri: '',
    //     },
    //   },
    // });
  };

  return (
    <FieldArray name={'references'}>
      {({ push: _push, remove }) => (
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
                <Button onClick={handleAdd} disabled={disabled}>
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
                    value={references[index].name}
                    readOnly={readOnly}
                    disabled={disabled}
                  />
                </Form.Group>
                <Form.Group as={Col}>
                  <FormikInputField
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
