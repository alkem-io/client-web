import ListAlt from '@mui/icons-material/ListAlt';
import clsx from 'clsx';
import React, { FC } from 'react';
import Section, { Body, Header as SectionHeader, SubHeader } from '../../components/core/Section';
import Tag from '../../components/core/Tag';
import { useUpdateNavigation } from '../../hooks';
import { makeStyles } from '@mui/styles';
import { Project as ProjectType, User } from '../../models/graphql-schema';
import { PageProps } from '../common';

const useStyles = makeStyles(theme => ({
  tag: {
    top: -theme.spacing(2),
    left: 0,
  },
  offset: {
    marginRight: theme.spacing(4),
  },
}));

interface ProjectPageProps extends PageProps {
  project: ProjectType;
  users: User[] | undefined;
  loading?: boolean;
}

const ProjectIndex: FC<ProjectPageProps> = ({ paths, project }): React.ReactElement => {
  const styles = useStyles();

  useUpdateNavigation({ currentPaths: paths });

  const { displayName: name, description, lifecycle } = project;

  return (
    <>
      <Section
        classes={{
          background: theme => theme.palette.positive.main,
        }}
        gutters={{
          root: true,
          content: true,
          details: false,
        }}
      >
        <SectionHeader text={name} />
        <Body text={description} />
        {lifecycle?.state && (
          <Tag text={lifecycle?.state} className={clsx('position-absolute', styles.tag)} color="neutralMedium" />
        )}
      </Section>
      <Section hideDetails avatar={<ListAlt color="primary" sx={{ fontSize: 120 }} />}>
        <SectionHeader text={'Solution details'} />
        <SubHeader text={'How we envision the first steps'} />
        <Body />
      </Section>
    </>
  );
};

export { ProjectIndex };
