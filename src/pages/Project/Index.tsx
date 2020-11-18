// import { ErrorBoundary } from '@sentry/react';
import { ReactComponent as CardListIcon } from 'bootstrap-icons/icons/card-list.svg';
import clsx from 'clsx';
import React, { FC } from 'react';
import Button from '../../components/core/Button';
import { CardContainer } from '../../components/core/Container';
import Divider from '../../components/core/Divider';
import Icon from '../../components/core/Icon';
import Section, { Body, Header as SectionHeader, SubHeader } from '../../components/core/Section';
import Tag from '../../components/core/Tag';
import { AspectCard } from '../../components/Opportunity/Cards';
import { Project as ProjectType, User } from '../../generated/graphql';
import { useUpdateNavigation } from '../../hooks/useNavigation';
import { createStyles } from '../../hooks/useTheme';
import { PageProps } from '../common';

const useStyles = createStyles(theme => ({
  tag: {
    top: -theme.shape.spacing(2),
    left: 0,
  },
  offset: {
    marginRight: theme.shape.spacing(4),
  },
}));

interface ProjectPageProps extends PageProps {
  project: ProjectType;
  users: User[] | undefined;
  loading?: boolean;
}

const ProjectIndex: FC<ProjectPageProps> = ({ paths, project, loading = false }): React.ReactElement => {
  const styles = useStyles();

  useUpdateNavigation({ currentPaths: paths });

  const { name, description, state, aspects } = project;

  return (
    <>
      <Section
        classes={{
          background: theme => theme.palette.positive,
        }}
        gutters={{
          root: true,
          content: true,
          details: false,
        }}
      >
        <SectionHeader text={name} />
        <Body text={description}></Body>
        {state && <Tag text={state} className={clsx('position-absolute', styles.tag)} color="neutralMedium" />}
      </Section>
      <Section hideDetails avatar={<Icon component={CardListIcon} color="primary" size="xl" />}>
        <SectionHeader text={'Solution details'} />
        <SubHeader text={'How we envision the first steps'} />
        <Body></Body>
      </Section>
      {aspects && (
        <CardContainer xs={12} md={6} lg={4} xl={3}>
          {aspects?.map((props, i) => (
            <AspectCard key={i} {...props} />
          ))}
        </CardContainer>
      )}
      <Divider />
    </>
  );
};

export { ProjectIndex };
