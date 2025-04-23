import PageContent from '@/core/ui/content/PageContent';
import { Outlet } from 'react-router-dom';
import FullWidthButton from '@/core/ui/button/FullWidthButton';
import PageContentColumnBase from '@/core/ui/content/PageContentColumnBase';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import ApplicationButtonContainer from '@/domain/access/ApplicationsAndInvitations/ApplicationButtonContainer';
import ApplicationButton from '@/domain/community/applicationButton/ApplicationButton';
import { Theme, useMediaQuery } from '@mui/material';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { MENU_STATE_KEY, MenuState, SubspaceInfoColumn } from './SubspaceInfoColumn';

export const SubspacePageLayout = () => {
  const { spaceId, parentSpaceId } = useUrlResolver();

  const isCollapsed = localStorage.getItem(MENU_STATE_KEY) === MenuState.COLLAPSED || false;

  const hasExtendedApplicationButton = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));

  return (
    <PageContent>
      <SubspaceInfoColumn />

      <PageContentColumnBase columns={isCollapsed ? 12 : 9} flexBasis={0} flexGrow={1} flexShrink={1} minWidth={0}>
        <ApplicationButtonContainer journeyId={spaceId} parentSpaceId={parentSpaceId}>
          {(applicationButtonProps, loading) => {
            if (loading || applicationButtonProps.isMember) {
              return null;
            }
            return (
              <PageContentColumn columns={9}>
                <ApplicationButton
                  {...applicationButtonProps}
                  loading={loading}
                  component={FullWidthButton}
                  extended={hasExtendedApplicationButton}
                  journeyId={'journeyId'}
                  spaceLevel={SpaceLevel.L1}
                />
              </PageContentColumn>
            );
          }}
        </ApplicationButtonContainer>

        <Outlet />
      </PageContentColumnBase>
    </PageContent>
  );
};
