import { makeStyles } from '@material-ui/core';
import Tab from '@material-ui/core/Tab/Tab';
import { TabContext, TabList, TabPanel } from '@material-ui/lab';
import { ReactComponent as PeopleIcon } from 'bootstrap-icons/icons/people.svg';
import React, { FC, useState } from 'react';
import { CommunicationMessageResult, User } from '../../types/graphql-schema';
import Button from '../core/Button';
import Icon from '../core/Icon';
import Section, { Body, Header as SectionHeader, SubHeader } from '../core/Section';
import Discussions from './Discussions';
import Members from './Members';
import Updates from './Updates';

export interface CommunitySectionPropsExt extends Omit<CommunitySectionProps, 'updates' | 'discussions' | 'users'> {}

interface CommunitySectionProps {
  title: string;
  subTitle: string;
  body?: string;
  users: User[];
  shuffle?: boolean;
  updates?: CommunicationMessageResult[];
  discussions?: CommunicationMessageResult[];
  onExplore?: () => void;
}

const useCommunityStyles = makeStyles(theme => ({
  tabPanel: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(0),
    paddingRight: theme.spacing(0),
  },
}));

export const CommunitySection: FC<CommunitySectionProps> = ({
  title,
  subTitle,
  body,
  users,
  updates,
  discussions,
  onExplore,
  shuffle = false,
}) => {
  const styles = useCommunityStyles();
  const [tabValue, setTabValue] = useState('members');

  const handleChange = (event: React.ChangeEvent<{}>, newValue: string) => {
    setTabValue(newValue);
  };

  return (
    <Section avatar={<Icon component={PeopleIcon} color="primary" size="xl" />}>
      <SectionHeader text={title} />
      <SubHeader text={subTitle} />
      <Body text={body}>
        <TabContext value={tabValue}>
          <TabList value={tabValue} onChange={handleChange} indicatorColor="primary" textColor="primary">
            <Tab label="Members" value={'members'}></Tab>
            <Tab label="Updates" value={'updates'} />
            <Tab label="Discussion" value={'discussion'} />
          </TabList>
          <TabPanel classes={{ root: styles.tabPanel }} value={'members'}>
            <Members shuffle={shuffle} users={users} />
            {onExplore && <Button text="Explore and connect" onClick={() => onExplore()} />}
          </TabPanel>
          <TabPanel classes={{ root: styles.tabPanel }} value={'updates'}>
            <Updates messages={updates} />
          </TabPanel>
          <TabPanel classes={{ root: styles.tabPanel }} value={'discussion'}>
            <Discussions messages={discussions} />
          </TabPanel>
        </TabContext>
      </Body>
    </Section>
  );
};
export default CommunitySection;
