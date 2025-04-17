import PageContent from '@/core/ui/content/PageContent';
import { Outlet } from 'react-router-dom';
import InfoColumn from '../components/InfoColumn';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import WelcomeBlock from '../components/WelcomeBlock';
import FullWidthButton from '@/core/ui/button/FullWidthButton';
import { CalendarMonth, KeyboardTab } from '@mui/icons-material';
import DialogActionButtons from '../components/subspaces/DialogActionButtons';
import ButtonWithTooltip from '@/core/ui/button/ButtonWithTooltip';
import PageContentColumnBase from '@/core/ui/content/PageContentColumnBase';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import ApplicationButtonContainer from '@/domain/access/ApplicationsAndInvitations/ApplicationButtonContainer';
import ApplicationButton from '@/domain/community/applicationButton/ApplicationButton';
import { Box, Drawer, IconButton, Paper, Theme, useMediaQuery } from '@mui/material';
import { gutters } from '@/core/ui/grid/utils';
import { theme } from '@/core/ui/themes/default/Theme';
import { AuthorizationPrivilege, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import DashboardUpdatesSection from '@/domain/shared/components/DashboardSections/DashboardUpdatesSection';
import DashboardNavigation from '../components/spaceDashboardNavigation/dashboardNavigation/DashboardNavigation';
import { useColumns } from '@/core/ui/grid/GridContext';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import useSpaceDashboardNavigation from '../components/spaceDashboardNavigation/useSpaceDashboardNavigation';
import { useSubspacePageQuery } from '@/core/apollo/generated/apollo-hooks';
import { useSubSpace } from '../hooks/useSubSpace';
import { buildUpdatesUrl } from '@/main/routing/urlBuilders';
import { DialogDef } from '../components/subspaces/DialogDefinition';
import { SubspaceDialog } from '../components/subspaces/SubspaceDialog';
import useInnovationFlowStates from '@/domain/collaboration/InnovationFlow/InnovationFlowStates/useInnovationFlowStates';
import SpaceWelcomeBlock from '../components/SpaceWelcomeBlock';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import { DialogAction } from '../components/subspaces/DialogAction';
import { SubspaceInfoColumn } from './SubspaceInfoColumn';
const MENU_STATE_KEY = 'menuState';
enum MenuState {
  EXPANDED = 'expanded',
  COLLAPSED = 'collapsed',
}

export const SubspacePageLayout = ({ level = SpaceLevel.L1 }: { level: SpaceLevel }) => {
  const { t } = useTranslation();
  const { spaceId, spaceLevel, parentSpaceId } = useUrlResolver();
  const {
    permissions,
    subspace: {
      about: {
        profile: { url },
      },
    },
  } = useSubSpace();

  const showInfoColumn = level === spaceLevel;
  const dashboardNavigation = useSpaceDashboardNavigation({
    spaceId,
    skip: !spaceId,
  });
  const { data: subspacePageData } = useSubspacePageQuery({
    variables: {
      spaceId: spaceId!,
    },
    skip: !spaceId || spaceLevel === SpaceLevel.L0 || !permissions.canRead,
  });

  const subspace = subspacePageData?.lookup.space;
  const about = subspace?.about;
  const membership = about?.membership;
  const communityId = membership?.communityID;
  const collaboration = subspace?.collaboration;
  const collaborationId = collaboration?.id;

  const innovationFlowProvided = useInnovationFlowStates({ collaborationId });
  const [createSpaceState, setCreateSpaceState] = useState<
    | {
        isDialogVisible: true;
        parentSpaceId: string;
      }
    | {
        isDialogVisible: false;
        parentSpaceId?: never;
      }
  >({
    isDialogVisible: false,
  });
  const handleOpenCreateSubspace = ({ id }) => {
    setCreateSpaceState({
      isDialogVisible: true,
      parentSpaceId: id,
    });
  };

  const [isCollapsed, setIsCollapsed] = useState(localStorage.getItem(MENU_STATE_KEY) === MenuState.COLLAPSED || false);

  const isMobile = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));
  const hasExtendedApplicationButton = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));

  const columns = 0; //useColumns();
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
