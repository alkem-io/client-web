import { ReactComponent as NodePlusIcon } from 'bootstrap-icons/icons/node-plus.svg';
import clsx from 'clsx';
import React, { FC } from 'react';
import { ActivityCard } from '../components/Challenge/Cards';
import Button from '../components/core/Button';
import Divider from '../components/core/Divider';
import Icon from '../components/core/Icon';
import Section, { Body, Header as SectionHeader, SubHeader } from '../components/core/Section';
import Tag from '../components/core/Tag';
import { opportunities } from '../components/core/Typography.dummy.json';
import { Theme } from '../context/ThemeProvider';
import { useUpdateNavigation } from '../hooks/useNavigation';
import { createStyles } from '../hooks/useTheme';
import { PageProps } from './common';

const useStyles = createStyles(theme => ({
  tag: {
    top: -theme.shape.spacing(2),
    left: 0,
  },
  offset: {
    marginRight: theme.shape.spacing(4),
  },
}));

const Opportunity: FC<PageProps> = ({ paths }): React.ReactElement => {
  const styles = useStyles();
  useUpdateNavigation({ currentPaths: paths });

  return (
    <>
      <Section
        classes={{
          background: theme => theme.palette.primary,
        }}
        gutters={{
          root: true,
          content: true,
          details: false,
        }}
        details={<ActivityCard />}
      >
        <Body className="d-flex flex-column flex-grow-1">
          <div className="d-flex flex-column flex-grow-1">
            <SectionHeader
              text={opportunities.list[0].title}
              className="flex-grow-1"
              classes={{ color: (theme: Theme) => theme.palette.neutralLight }}
            />
          </div>
          <div className="flex-row">
            <Button
              className={styles.offset}
              inset
              variant="primary"
              text="projects"
              onClick={() => console.log('projects')}
            />
            <Button className={styles.offset} inset variant="primary" text="demo" onClick={() => console.log('demo')} />
            <Button
              className={styles.offset}
              inset
              variant="primary"
              text="github"
              onClick={() => console.log('github')}
            />
          </div>
        </Body>
        <Tag
          text={opportunities.list[0].caption}
          className={clsx('position-absolute', styles.tag)}
          color="neutralMedium"
        />
      </Section>
      <Section hideDetails avatar={<Icon component={NodePlusIcon} color="primary" size="xl" />}>
        <SectionHeader text={'ADOPTION ECOSYSTEM'} />
        <SubHeader text={'Stakeholders & Key users'} />
      </Section>
      <Divider />
    </>
  );
};

export { Opportunity };
