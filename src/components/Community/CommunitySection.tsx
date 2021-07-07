import { makeStyles } from '@material-ui/core';
import Tab from '@material-ui/core/Tab/Tab';
import { TabContext, TabList, TabPanel } from '@material-ui/lab';
import { ReactComponent as PeopleIcon } from 'bootstrap-icons/icons/people.svg';
import React, { FC, useState } from 'react';
import { Message, User } from '../../types/graphql-schema';
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
const closure = (date, offset: number) => {
  const newDate = new Date(date);
  newDate.setMilliseconds(offset);
  return newDate.getTime();
};
const date = new Date();

const messages: Message[] = [
  {
    id: '1',
    message:
      "Rick and Morty is an American adult animated science fiction sitcom created by Justin Roiland and Dan Harmon for Cartoon Network's nighttime programming block, Adult Swim. The series follows the misadventures of cynical mad scientist Rick Sanchez and his good-hearted but fretful grandson Morty Smith, who split their time between domestic life and interdimensional adventures.",
    reciever: '',
    sender: 'Pesho',
    timestamp: closure(date, 0),
  },
  {
    id: '2',
    message:
      "In May 2012, Adult Swim unveiled its development slate that included a Rick and Morty pilot from Harmon and Roiland,[8] which was eventually picked up to series in October 2012, as one of the network's first primetime original shows.[9] The first season premiered in December 2013 and concluded in April 2014. It comprised eleven episodes (including the pilot), and aired Mondays at 10:30 pm ET/PT.[10]",
    reciever: '',
    sender: 'Pesho',
    timestamp: closure(date, 100000),
  },
  {
    id: '3',
    message:
      'Star Wars is an American epic space opera[1] multimedia franchise created by George Lucas, which began with the eponymous 1977 film[b] and quickly became a worldwide pop-culture phenomenon. The franchise has been expanded into various films and other media, including television series, video games, novels, comic books, theme park attractions, and themed areas, comprising an all-encompassing fictional universe.[c] In 2020, its total value was estimated at US$70 billion, and it is currently the fifth-highest-grossing media franchise of all time.',
    reciever: '',
    sender: 'Pesho',
    timestamp: closure(date, 350000),
  },
];

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
            <Updates messages={messages} />
          </TabPanel>
          <TabPanel classes={{ root: styles.tabPanel }} value={'discussion'}>
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
