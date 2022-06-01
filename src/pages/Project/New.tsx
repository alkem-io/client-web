import { Box, TextField } from '@mui/material';
import FilePresent from '@mui/icons-material/FilePresent';
import { Form, Formik } from 'formik';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import Button from '../../components/core/Button';
import Section, { Body, Header as SectionHeader, SubHeader } from '../../components/core/Section';
import { ContentCard } from '../../components/composite/entities/Project/Cards';
import { useUpdateNavigation } from '../../hooks';
import { makeStyles } from '@mui/styles';
import { Project as ProjectType, User } from '../../models/graphql-schema';
import { PageProps } from '../common';
import { nameIdValidator, displayNameValidator } from '../../utils/validator';

const useStyles = makeStyles(theme => ({
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

const ProjectNew: FC<ProjectPageProps> = ({ paths, onCreate, loading }): React.ReactElement => {
  useUpdateNavigation({ currentPaths: paths });

  const { t } = useTranslation();
  const styles = useStyles();
  const navigate = useNavigate();

  const initialValues = {
    name: 'New project',
    shortName: '',
    description: '',
  };
  const validationSchema = yup.object().shape({
    name: displayNameValidator,
    shortName: nameIdValidator,
    description: yup.string().required(t('forms.validations.required')),
  });

  return (
    <>
      <Section avatar={<FilePresent color="primary" sx={{ fontSize: 120 }} />}>
        <SectionHeader text={t('pages.opportunity.sections.projects.new-project.header')} />
        <SubHeader text={t('pages.opportunity.sections.projects.new-project.subheader')} />
        <Body text={t('pages.opportunity.sections.projects.new-project.body')}></Body>
        <ContentCard title="Project name & description">
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={({ name, description, shortName }) =>
              onCreate({ displayName: name, description, nameID: shortName })
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
                  label={'Short name'}
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
                <Box display={'flex'}>
                  <Button
                    disabled={loading}
                    text={t('buttons.cancel-project')}
                    variant="transparent"
                    inset
                    onClick={() => navigate(-1)}
                  />
                  <Box flexGrow={1} />
                  <Button type={'submit'} text={t('buttons.create-project')} variant="primary" disabled={!isValid} />
                </Box>
              </Form>
            )}
          </Formik>
        </ContentCard>
      </Section>
    </>
  );
};

export { ProjectNew };
