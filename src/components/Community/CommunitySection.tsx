import Tab from '@material-ui/core/Tab/Tab';
import { TabContext, TabList, TabPanel } from '@material-ui/lab';
import { ReactComponent as PeopleIcon } from 'bootstrap-icons/icons/people.svg';
import React, { FC, useState } from 'react';
import { User } from '../../types/graphql-schema';
import Button from '../core/Button';
import Icon from '../core/Icon';
import Section, { Body, Header, Header as SectionHeader, SubHeader } from '../core/Section';
import Members from './Members';
import Updates from './Updates';

interface CommunitySectionProps {
  title: string;
  subTitle: string;
  body?: string;
  users: User[];
  shuffle?: boolean;
  onExplore?: () => void;
}

export const CommunitySection: FC<CommunitySectionProps> = ({
  title,
  subTitle,
  body,
  users,
  onExplore,
  shuffle = false,
}) => {
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
          <TabPanel value={'members'}>
            <Members shuffle={shuffle} users={users} />
            {onExplore && <Button text="Explore and connect" onClick={() => onExplore()} />}
          </TabPanel>
          <TabPanel value={'updates'}>
            <Updates messages={[]} />
          </TabPanel>
          <TabPanel value={'discussion'}>
            <Section gutters={{ root: true, avatar: false, content: false }}>
              <Header text="" tagText="coming soon" />
            </Section>
          </TabPanel>
        </TabContext>
      </Body>
    </Section>
  );
};
export default CommunitySection;
