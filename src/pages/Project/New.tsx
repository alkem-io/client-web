import { TextField } from '@material-ui/core';
import { ReactComponent as FileEarmarkPostIcon } from 'bootstrap-icons/icons/file-earmark-post.svg';
import { Formik } from 'formik';
import React, { FC } from 'react';
import { Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import * as yup from 'yup';
import Button from '../../components/core/Button';
import Divider from '../../components/core/Divider';
import Icon from '../../components/core/Icon';
import Section, { Body, Header as SectionHeader, SubHeader } from '../../components/core/Section';
import { ContentCard } from '../../components/Project/Cards';
import { useUpdateNavigation } from '../../hooks';
import { createStyles } from '../../hooks/useTheme';
import { Project as ProjectType, User } from '../../models/graphql-schema';
import { PageProps } from '../common';

const useStyles = createStyles(theme => ({
  tag: {
    top: -theme.spacing(2),
    left: 0,
  },
  offset: {
    marginRight: theme.spacing(4),
  },
  spacer: {
    padding: theme.spacing(1),
  },
}));

interface ProjectPageProps extends PageProps {
  users: User[] | undefined;
  loading?: boolean;
  onCreate: (project: Pick<ProjectType, 'displayName' | 'description' | 'nameID'>) => void;
}

const createTextId = (value: string) => {
  return value
    .split(' ')
    .flatMap(x => x.split('-'))
    .join('-');
};

const ProjectNew: FC<ProjectPageProps> = ({ paths, onCreate, loading }): React.ReactElement => {
  useUpdateNavigation({ currentPaths: paths });

  const { t } = useTranslation();
  const styles = useStyles();
  const history = useHistory();

  const initialValues = {
    name: 'New project',
    shortName: '',
    description: '',
  };
  const validationSchema = yup.object().shape({
    name: yup.string().required(t('forms.validations.required')),
    shortName: yup.string().required(t('forms.validations.required')).min(3),
    description: yup.string().required(t('forms.validations.required')),
  });

  return (
    <>
      <Section avatar={<Icon component={FileEarmarkPostIcon} color="primary" size="xl" />}>
        <SectionHeader text={t('pages.opportunity.sections.projects.new-project.header')} />
        <SubHeader text={t('pages.opportunity.sections.projects.new-project.subheader')} />
        <Body text={t('pages.opportunity.sections.projects.new-project.body')}></Body>
        <ContentCard title="Project name & description">
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={({ name, description, shortName }) =>
              onCreate({ displayName: name, description, nameID: createTextId(shortName) })
            }
          >
            {({ isValid, handleSubmit, handleChange, handleBlur, errors }) => (
              <Form noValidate onSubmit={handleSubmit}>
                <div>
                  <TextField
                    name={'name'}
                    label={'Name'}
                    defaultValue={'New Project'}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    variant={'outlined'}
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.name}
                    helperText={errors.name}
                    fullWidth
                  />
                </div>
                <div className={styles.spacer}></div>
                <TextField
                  name={'shortName'}
                  label={'Short name (max 2 words)'}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  variant={'outlined'}
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.shortName}
                  helperText={errors.shortName}
                  fullWidth
                />
                <div className={styles.spacer}></div>
                <TextField
                  name={'description'}
                  label={'Description'}
                  multiline
                  rows={3}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  variant={'outlined'}
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.description}
                  helperText={errors.description}
                  fullWidth
                />
                <div className={styles.spacer}></div>
                <div className={'d-flex'}>
                  <Button
                    disabled={loading}
                    text="Cancel project"
                    variant="transparent"
                    inset
                    onClick={() => history.goBack()}
                  />
                  <div className={'flex-grow-1'}></div>
                  <Button type={'submit'} text="create project" variant="primary" disabled={!isValid} />
                </div>
              </Form>
            )}
          </Formik>
        </ContentCard>
      </Section>
      <Divider />
    </>
  );
};

export { ProjectNew };
