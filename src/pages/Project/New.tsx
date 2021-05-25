import { ReactComponent as FileEarmarkPostIcon } from 'bootstrap-icons/icons/file-earmark-post.svg';
import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import Button from '../../components/core/Button';
import Divider from '../../components/core/Divider';
import Icon from '../../components/core/Icon';
import Section, { Body, Header as SectionHeader, SubHeader } from '../../components/core/Section';
import TextInput, { TextArea } from '../../components/core/TextInput';
import { ContentCard } from '../../components/Project/Cards';
import { useUpdateNavigation } from '../../hooks/useNavigation';
import { createStyles } from '../../hooks/useTheme';
import { Project as ProjectType, User } from '../../types/graphql-schema';
import { PageProps } from '../common';

const useStyles = createStyles(theme => ({
  tag: {
    top: -theme.shape.spacing(2),
    left: 0,
  },
  offset: {
    marginRight: theme.shape.spacing(4),
  },
  spacer: {
    padding: theme.shape.spacing(1),
  },
}));

interface ProjectPageProps extends PageProps {
  users: User[] | undefined;
  loading?: boolean;
  onCreate: (project: Pick<ProjectType, 'displayName' | 'description' | 'nameID'>) => void;
}

const textIdValidator = (value: string) => {
  if (!value) return false;

  const parts = value.split(' ').flatMap(x => x.split('-'));

  if (parts.length > 2 || parts.length === 0) return false;
  if (parts.some(x => /\s/.test(x))) return false;

  return true;
};

const createTextId = (value: string) => {
  return value
    .split(' ')
    .flatMap(x => x.split('-'))
    .join('-');
};

const ProjectNew: FC<ProjectPageProps> = ({ paths, onCreate, loading }): React.ReactElement => {
  const { t } = useTranslation();
  const styles = useStyles();
  const history = useHistory();

  useUpdateNavigation({ currentPaths: paths });
  const [name, setName] = useState('New project');
  const [shortName, setShortName] = useState('');
  const [description, setDescription] = useState('');
  const [formValid, setFormValid] = useState(false);

  useEffect(() => {
    setFormValid(textIdValidator(shortName));
  }, [shortName, setFormValid]);

  return (
    <>
      <Section avatar={<Icon component={FileEarmarkPostIcon} color="primary" size="xl" />}>
        <SectionHeader text={t('pages.opportunity.sections.projects.new-project.header')} />
        <SubHeader text={t('pages.opportunity.sections.projects.new-project.subheader')} />
        <Body text={t('pages.opportunity.sections.projects.new-project.body')}></Body>
        <ContentCard title="Project name & description">
          <TextInput label="project name" value={name} error={!name} onChange={e => setName(e.target.value)} />
          <div className={styles.spacer}></div>
          <TextInput
            label="project short name (max 2 words)"
            value={shortName}
            error={!formValid}
            disabled={loading}
            onChange={e => setShortName(e.target.value)}
          />

          <div className={styles.spacer}></div>
          <TextArea
            label="project description"
            value={description}
            error={!description}
            disabled={loading}
            onChange={e => setDescription(e.target.value)}
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
            <Button
              text="create project"
              variant="primary"
              disabled={!name || !description || !formValid || loading}
              onClick={() => onCreate({ displayName: name, description, nameID: createTextId(shortName) })}
            />
          </div>
        </ContentCard>
      </Section>
      <Divider />
    </>
  );
};

export { ProjectNew };
