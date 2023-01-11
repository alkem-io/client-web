import { TabContext, TabList, TabPanel } from '@mui/lab';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab/Tab';
import makeStyles from '@mui/styles/makeStyles';
import PeopleOutline from '@mui/icons-material/PeopleOutline';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useResolvedPath } from 'react-router-dom';
import WrapperButton from '../../../../../common/components/core/WrapperButton';
import WrapperMarkdown from '../../../../../core/ui/markdown/WrapperMarkdown';
import Section, { Body, Header as SectionHeader, SubHeader } from '../../../../../common/components/core/Section';
import { useCommunityContext } from '../../CommunityContext';
import { useConfig } from '../../../../platform/config/useConfig';
import { Discussion } from '../../../../communication/discussion/models/discussion';
import { AuthorizationPrivilege, Message, User } from '../../../../../core/apollo/generated/graphql-schema';
import { CommunityUpdatesView } from '../CommunityUpdates/CommunityUpdatesView';
import DiscussionsView from './DiscussionsView';
import MembersView from './MembersView';
import { useAuthorsDetails } from '../../../../communication/communication/useAuthorsDetails';
import { FEATURE_COMMUNICATIONS } from '../../../../platform/config/features.constants';

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

const EMPTY = [];

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

  const areCommunicationsEnabled = isFeatureEnabled(FEATURE_COMMUNICATIONS);

  const updatesCountLabel = updates?.length ? `(${updates?.length})` : '';
  const discussionsCountLabel = discussions?.length ? `(${discussions?.length})` : '';
  const tabList: TabConfig[] = [
    { name: 'members', label: t('common.members'), enabled: true },
    {
      name: 'updates',
      label: `${t('common.updates')} ${updatesCountLabel}`,
      enabled: areCommunicationsEnabled,
    },
    {
      name: 'discussion',
      label: `${t('common.discussions')} ${discussionsCountLabel}`,
      enabled: areCommunicationsEnabled,
    },
  ].filter(x => x.enabled);

  const { authors = EMPTY } = useAuthorsDetails(updateSenders?.map(sender => sender.id) ?? EMPTY);

  return (
    <Section avatar={<PeopleOutline color="primary" sx={{ fontSize: 120 }} />} hideDetails>
      <SectionHeader text={title} />
      <SubHeader text={subTitle} />
      <Body>
        <WrapperMarkdown children={body || ''} />
        <TabContext value={tabValue}>
          <TabList value={tabValue} onChange={handleChange} indicatorColor="primary" textColor="primary">
            {tabList.map((t, i) => (
              <Tab key={`${t.name}-${i}`} label={t.label} value={t.name} disabled={t.showOnly} />
            ))}
          </TabList>
          <TabPanel classes={{ root: styles.tabPanel }} value={'members'}>
            <MembersView shuffle={shuffle} users={users} entityId={parentEntityId} />
            <WrapperButton text={t('buttons.explore-and-connect')} as={RouterLink} to={`${url}/community`} />
          </TabPanel>
          {areCommunicationsEnabled && (
            <>
              <TabPanel classes={{ root: styles.tabPanel }} value={'updates'}>
                <Box>
                  {updates && (
                    <CommunityUpdatesView
                      entities={{
                        authors,
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
