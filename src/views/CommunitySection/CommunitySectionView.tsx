import { makeStyles } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Tab from '@material-ui/core/Tab/Tab';
import { TabContext, TabList, TabPanel } from '@material-ui/lab';
import { ReactComponent as PeopleIcon } from 'bootstrap-icons/icons/people.svg';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useRouteMatch } from 'react-router-dom';
import Button from '../../components/core/Button';
import Icon from '../../components/core/Icon';
import Markdown from '../../components/core/Markdown';
import Section, { Body, Header as SectionHeader, SubHeader } from '../../components/core/Section';
import { AvatarsProvider } from '../../context/AvatarsProvider';
import { useConfig } from '../../hooks';
import { FEATURE_COMMUNICATIONS } from '../../models/constants';
import { Message, User } from '../../models/graphql-schema';
import { Discussion } from '../../models/discussion/discussion';
import { CommunityUpdatesView } from '../CommunityUpdates/CommunityUpdatesView';
import DiscussionsView from './DiscussionsView';
import MembersView from './MembersView';

export interface CommunitySectionPropsExt
  extends Omit<CommunitySectionProps, 'updates' | 'discussions' | 'users' | 'parentEntityId'> {}

interface CommunitySectionProps {
  title: string;
  subTitle: string;
  body?: string;
  users: User[];
  shuffle?: boolean;
  updates?: Message[];
  updateSenders?: Pick<User, 'id'>[];
  discussions?: Discussion[];
  parentEntityId: string;
}

const useCommunityStyles = makeStyles(theme => ({
  tabPanel: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(0),
    paddingRight: theme.spacing(0),
  },
}));

type TabConfig = {
  name: string;
  label: string;
  enabled: boolean;
  showOnly?: boolean;
};

export const CommunitySection: FC<CommunitySectionProps> = ({
  title,
  subTitle,
  body,
  users,
  updates,
  updateSenders,
  discussions,
  shuffle = false,
  parentEntityId,
}) => {
  const { url } = useRouteMatch();
  const { t } = useTranslation();
  const styles = useCommunityStyles();
  const [tabValue, setTabValue] = useState('members');
  const { isFeatureEnabled } = useConfig();
  const handleChange = (_event: React.ChangeEvent<{}>, newValue: string) => {
    setTabValue(newValue);
  };

  const updatesCountLabel = updates?.length ? `(${updates?.length})` : '';
  const tabList: TabConfig[] = [
    { name: 'members', label: t('common.members'), enabled: true },
    {
      name: 'updates',
      label: `${t('common.updates')} ${updatesCountLabel}`,
      enabled: isFeatureEnabled(FEATURE_COMMUNICATIONS),
    },
    {
      name: 'discussion',
      label: t('common.discussions'),
      enabled: isFeatureEnabled(FEATURE_COMMUNICATIONS),
    },
  ].filter(x => x.enabled);

  return (
    <Section avatar={<Icon component={PeopleIcon} color="primary" size="xl" />} hideDetails>
      <SectionHeader text={title} />
      <SubHeader text={subTitle} />
      <Body>
        <Markdown children={body || ''} />
        <TabContext value={tabValue}>
          <TabList value={tabValue} onChange={handleChange} indicatorColor="primary" textColor="primary">
            {tabList.map((t, i) => (
              <Tab key={`${t.name}-${i}`} label={t.label} value={t.name} disabled={t.showOnly} />
            ))}
          </TabList>
          <TabPanel classes={{ root: styles.tabPanel }} value={'members'}>
            <MembersView shuffle={shuffle} users={users} entityId={parentEntityId} />
            <Button text={t('buttons.explore-and-connect')} as={RouterLink} to={`${url}/community`} />
          </TabPanel>
          {isFeatureEnabled(FEATURE_COMMUNICATIONS) && (
            <>
              <TabPanel classes={{ root: styles.tabPanel }} value={'updates'}>
                <Box>
                  {updates && (
                    <AvatarsProvider users={updateSenders}>
                      {detailedUsers => (
                        <CommunityUpdatesView
                          entities={{
                            members: detailedUsers,
                            messages: updates,
                          }}
                          options={{
                            hideHeaders: true,
                            itemsPerRow: 1,
                            disableElevation: true,
                            disableCollapse: true,
                          }}
                          state={{
                            loadingMessages: false,
                            submittingMessage: false,
                            removingMessage: false,
                          }}
                        />
                      )}
                    </AvatarsProvider>
                  )}
                </Box>
              </TabPanel>

              <TabPanel classes={{ root: styles.tabPanel }} value={'discussion'}>
                <DiscussionsView discussions={discussions} />
              </TabPanel>
            </>
          )}
        </TabContext>
      </Body>
    </Section>
  );
};
export default CommunitySection;
