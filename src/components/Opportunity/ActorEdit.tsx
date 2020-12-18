import React, { FC } from 'react';
import { Modal } from 'react-bootstrap';
import Button from '../core/Button';
import { ActorInput, useCreateActorMutation, useUpdateActorMutation } from '../../generated/graphql';
import * as yup from 'yup';
import { Formik } from 'formik';
import TextInput, { TextArea } from '../core/TextInput';
import { createStyles } from '../../hooks/useTheme';
import { QUERY_OPPORTUNITY_ACTOR_GROUPS } from '../../graphql/opportunity';

interface Props {
  show: boolean;
  onHide: () => void;
  data?: ActorInput;
  id?: string;
  opportunityId?: string | undefined;
  actorGroupId?: string | undefined;
  isCreate?: boolean;
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

const ActorEdit: FC<Props> = ({ show, onHide, data, id, opportunityId, actorGroupId, isCreate = false }) => {
  const styles = useContextEditStyles();

  const initialValues: ActorInput = {
    name: data?.name || '',
    description: data?.description || '',
    value: data?.value || '',
    impact: data?.impact || '',
  };
  const validationSchema = yup.object().shape({
    name: yup.string().required(),
    description: yup.string().required(),
    value: yup.string().required(),
    impact: yup.string().required(),
  });

  const [createActor] = useCreateActorMutation({
    onCompleted: () => onHide(),
    onError: e => console.error(e), // eslint-disable-line no-console
    refetchQueries: [{ query: QUERY_OPPORTUNITY_ACTOR_GROUPS, variables: { id: Number(opportunityId) } }],
    awaitRefetchQueries: true,
  });

  const [updateActor] = useUpdateActorMutation({
    onCompleted: () => onHide(),
    onError: e => console.error(e), // eslint-disable-line no-console
    refetchQueries: [{ query: QUERY_OPPORTUNITY_ACTOR_GROUPS, variables: { id: Number(opportunityId) } }],
    awaitRefetchQueries: true,
  });

  const onSubmit = values => {
    if (isCreate) {
      createActor({
        variables: {
          actorData: values,
          actorGroupID: Number(actorGroupId),
        },
      });

      return;
    }
    updateActor({
      variables: {
        ID: Number(id),
        actorData: values,
      },
    });
  };

  let submitWired;

  return (
    <Modal show={show} onHide={onHide} centered size={'xl'}>
      <Modal.Header closeButton>
        <Modal.Title>{isCreate ? 'Create' : 'Edit'} Actor</Modal.Title>
      </Modal.Header>
      <Modal.Body className={styles.body}>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize
          onSubmit={values => onSubmit(values)}
        >
          {({ values, handleChange, errors, handleSubmit, touched }) => {
            const getField = (name: string, label: string, type?: 'input' | 'textArea') => (
              <>
                {type === 'input' ? (
                  <TextInput
                    onChange={handleChange}
                    name={name}
                    value={values[name] as string}
                    label={label}
                    error={touched[name] && !!errors[name]}
                    className={styles.field}
                  />
                ) : (
                  <TextArea
                    onChange={handleChange}
                    name={name}
                    value={values[name] as string}
                    label={label}
                    error={touched[name] && !!errors[name]}
                    className={styles.field}
                    rows={2}
                  />
                )}
              </>
            );

            if (!submitWired) {
              submitWired = handleSubmit;
            }

            return (
              <>
                {getField('name', 'Name', 'input')}
                {getField('description', 'Description')}
                {getField('value', 'Value')}
                {getField('impact', 'Impact')}
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
          {isCreate ? 'Create' : 'SAVE'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ActorEdit;
