import React, { FC } from 'react';
import { Form, Modal } from 'react-bootstrap';
import Button from '../core/Button';
import {
  Aspect,
  useOpportunityTemplateQuery,
  useCreateAspectMutation,
  useUpdateAspectMutation,
  OpportunityActorGroupsDocument,
} from '../../generated/graphql';
import * as yup from 'yup';
import { Formik } from 'formik';
import { TextArea } from '../core/TextInput';
import { createStyles } from '../../hooks/useTheme';
import { replaceAll } from '../../utils/replaceAll';

interface Props {
  show: boolean;
  onHide: () => void;
  data?: Aspect;
  id?: string;
  opportunityId?: string | undefined;
  actorGroupId?: string;
  isCreate?: boolean;
  existingAspectNames?: string[];
}

const useContextEditStyles = createStyles(theme => ({
  field: {
    marginBottom: theme.shape.spacing(2),
  },
  row: {
    display: 'flex',
    gap: 20,
    alignItems: 'center',
    '& > div': {
      flexGrow: 1,
    },
  },
  body: {
    maxHeight: 600,
    overflow: 'auto',
  },
}));

const AspectEdit: FC<Props> = ({ show, onHide, data, id, opportunityId, existingAspectNames }) => {
  const styles = useContextEditStyles();
  const { data: config } = useOpportunityTemplateQuery();
  const aspectsTypes = config?.configuration.template.opportunities[0].aspects;
  const isCreate = !id;

  const availableTypes =
    isCreate && existingAspectNames
      ? aspectsTypes?.filter(at => !existingAspectNames.includes(replaceAll('_', ' ', at)))
      : aspectsTypes;

  const initialValues: Aspect = {
    id: id || '',
    title: (isCreate ? availableTypes && availableTypes[0] : data?.title) || '',
    framing: data?.framing || '',
    explanation: data?.explanation || '',
  };
  const validationSchema = yup.object().shape({
    title: yup.string().required(),
    framing: yup.string().required(),
    explanation: yup.string().required(),
  });

  const [updateAspect] = useUpdateAspectMutation({
    onCompleted: () => onHide(),
    onError: e => console.error(e),
    refetchQueries: [{ query: OpportunityActorGroupsDocument, variables: { id: Number(opportunityId) } }],
    awaitRefetchQueries: true,
  });

  const [createAspect] = useCreateAspectMutation({
    onCompleted: () => onHide(),
    onError: e => console.error(e),
    refetchQueries: [{ query: OpportunityActorGroupsDocument, variables: { id: Number(opportunityId) } }],
    awaitRefetchQueries: true,
  });

  const onSubmit = async (values: Aspect) => {
    if (!id) {
      await createAspect({
        variables: {
          input: {
            parentID: Number(opportunityId),
            ...values,
          },
        },
      });

      return;
    } else {
      await updateAspect({
        variables: {
          input: {
            ID: id,
            ...values,
          },
        },
      });
    }
  };

  let submitWired;

  return (
    <Modal show={show} onHide={onHide} centered size={'xl'}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Aspect</Modal.Title>
      </Modal.Header>
      <Modal.Body className={styles.body}>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize
          onSubmit={values => onSubmit(values)}
        >
          {({ values, handleChange, errors, touched, handleSubmit, setFieldValue }) => {
            const getField = (name: string, label: string) => (
              <TextArea
                onChange={handleChange}
                name={name}
                value={values[name] as string}
                label={label}
                error={touched[name] && !!errors[name]}
                className={styles.field}
                rows={2}
              />
            );

            if (!submitWired) {
              submitWired = handleSubmit;
            }

            return (
              <>
                <Form.Group controlId="aspectTypeSelect">
                  <Form.Label>Aspect Type</Form.Label>
                  <Form.Control
                    as="select"
                    custom
                    onChange={e => {
                      e.preventDefault();
                      setFieldValue('title', e.target.value);
                    }}
                    size={'lg'}
                    disabled={!isCreate}
                    defaultValue={values.title ? replaceAll('_', ' ', values.title) : values.title}
                  >
                    {availableTypes?.map((at, index) => (
                      <option value={at} key={index}>
                        {replaceAll('_', ' ', at)}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
                {getField('framing', 'Framing')}
                {getField('explanation', 'Explanation')}
              </>
            );
          }}
        </Formik>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="negative" onClick={onHide} className={'mr-2'}>
          CANCEL
        </Button>
        <Button type={'submit'} variant="primary" onClick={() => submitWired()}>
          SAVE
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AspectEdit;
