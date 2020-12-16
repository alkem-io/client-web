import React, { FC } from 'react';
import { Modal } from 'react-bootstrap';
import Button from '../core/Button';
import { AspectInput, useUpdateAspectMutation } from '../../generated/graphql';
import * as yup from 'yup';
import { Formik } from 'formik';
import TextInput, { TextArea } from '../core/TextInput';
import { createStyles } from '../../hooks/useTheme';
import { QUERY_OPPORTUNITY_ACTOR_GROUPS } from '../../graphql/opportunity';

interface Props {
  show: boolean;
  onHide: () => void;
  data?: AspectInput;
  id?: string;
  opportunityId?: string | undefined;
  actorGroupId?: string;
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

const AspectEdit: FC<Props> = ({ show, onHide, data, id, opportunityId }) => {
  const styles = useContextEditStyles();
  // const { data: aspectsTypes } = useAspectsTemplateListQuery();

  // console.log('aspectsTypes --> ', aspectsTypes);

  const initialValues: AspectInput = {
    title: data?.title || '',
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
    refetchQueries: [{ query: QUERY_OPPORTUNITY_ACTOR_GROUPS, variables: { id: Number(opportunityId) } }],
    awaitRefetchQueries: true,
  });

  const onSubmit = values => {
    updateAspect({
      variables: {
        ID: Number(id),
        aspectData: values,
      },
    });
  };

  let submitWired;

  return (
    <Modal show={show} onHide={onHide} centered size={'xl'}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Actor</Modal.Title>
      </Modal.Header>
      <Modal.Body className={styles.body}>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize
          onSubmit={values => onSubmit(values)}
        >
          {({ values, handleChange, errors, handleSubmit }) => {
            const getField = (name: string, label: string, type?: 'input' | 'textArea') => (
              <>
                {type === 'input' ? (
                  <TextInput
                    onChange={handleChange}
                    name={name}
                    value={values[name] as string}
                    label={label}
                    error={!!errors[name]}
                    className={styles.field}
                  />
                ) : (
                  <TextArea
                    onChange={handleChange}
                    name={name}
                    value={values[name] as string}
                    label={label}
                    error={!!errors[name]}
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
                {getField('title', 'Title', 'input')}
                {getField('framing', 'Farming')}
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
