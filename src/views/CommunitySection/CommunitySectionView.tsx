import { TabContext, TabList, TabPanel } from '@mui/lab';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab/Tab';
import makeStyles from '@mui/styles/makeStyles';
import PeopleOutline from '@mui/icons-material/PeopleOutline';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useResolvedPath } from 'react-router-dom';
import Button from '../../components/core/Button';
import Markdown from '../../components/core/Markdown';
import Section, { Body, Header as SectionHeader, SubHeader } from '../../components/core/Section';
import { AvatarsProvider } from '../../context/AvatarsProvider';
import { useCommunityContext } from '../../context/CommunityProvider';
import { useConfig } from '../../hooks';
import { FEATURE_COMMUNICATIONS } from '../../models/constants';
import { Discussion } from '../../models/discussion/discussion';
import { AuthorizationPrivilege, Message, User } from '../../models/graphql-schema';
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
  const { pathname: url } = useResolvedPath('.');
  const { t } = useTranslation();
  const styles = useCommunityStyles();
  const [tabValue, setTabValue] = useState('members');
  const { isFeatureEnabled } = useConfig();
  const handleChange = (_event: React.ChangeEvent<{}>, newValue: string) => {
    setTabValue(newValue);
  };

  const { communicationPrivileges } = useCommunityContext();
  const canCreateDiscussions = communicationPrivileges.some(x => x === AuthorizationPrivilege.Create);

  const updatesCountLabel = updates?.length ? `(${updates?.length})` : '';
  const discussionsCountLabel = discussions?.length ? `(${discussions?.length})` : '';
  const tabList: TabConfig[] = [
    { name: 'members', label: t('common.members'), enabled: true },
    {
      name: 'updates',
      label: `${t('common.updates')} ${updatesCountLabel}`,
      enabled: isFeatureEnabled(FEATURE_COMMUNICATIONS),
    },
    {
      name: 'discussion',
      label: `${t('common.discussions')} ${discussionsCountLabel}`,
      enabled: isFeatureEnabled(FEATURE_COMMUNICATIONS),
    },
  ].filter(x => x.enabled);

  return (
    <Section avatar={<PeopleOutline color="primary" sx={{ fontSize: 120 }} />} hideDetails>
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
                <DiscussionsView discussions={discussions} canCreate={canCreateDiscussions} />
              </TabPanel>
            </>
          )}
        </TabContext>
      </Body>
    </Section>
  );
};
export default CommunitySection;
