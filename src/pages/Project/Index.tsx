import { ReactComponent as CardListIcon } from 'bootstrap-icons/icons/card-list.svg';
import clsx from 'clsx';
import React, { FC } from 'react';
import { CardContainer } from '../../components/core/Container';
import Divider from '../../components/core/Divider';
import Icon from '../../components/core/Icon';
import Section, { Body, Header as SectionHeader, SubHeader } from '../../components/core/Section';
import Tag from '../../components/core/Tag';
import { AspectCard } from '../../components/Opportunity/Cards';
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
}));

interface ProjectPageProps extends PageProps {
  project: ProjectType;
  users: User[] | undefined;
  loading?: boolean;
}

const ProjectIndex: FC<ProjectPageProps> = ({ paths, project }): React.ReactElement => {
  const styles = useStyles();

  useUpdateNavigation({ currentPaths: paths });

  const { displayName: name, description, lifecycle, aspects } = project;

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
        <Body text={description} />
        {lifecycle?.state && (
          <Tag text={lifecycle?.state} className={clsx('position-absolute', styles.tag)} color="neutralMedium" />
        )}
      </Section>
      <Section hideDetails avatar={<Icon component={CardListIcon} color="primary" size="xl" />}>
        <SectionHeader text={'Solution details'} />
        <SubHeader text={'How we envision the first steps'} />
        <Body />
      </Section>
      {aspects && (
        <CardContainer xs={12} md={6} lg={4} xl={3}>
          {aspects?.map((props, i) => (
            // Opportunity ID  is mocked for projects atm.
            <AspectCard key={i} opportunityId={'1'} {...props} />
          ))}
        </CardContainer>
      )}
      <Divider />
    </>
  );
};

export { ProjectIndex };
