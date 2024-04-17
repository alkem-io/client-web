import React, {
  Children,
  createContext,
  PropsWithChildren,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import ChildJourneyPageBanner from '../../common/childJourneyPageBanner/ChildJourneyPageBanner';
import JourneyUnauthorizedDialog from '../../common/JourneyUnauthorizedDialog/JourneyUnauthorizedDialog';
import JourneyUnauthorizedDialogContainer from '../../common/JourneyUnauthorizedDialog/JourneyUnauthorizedDialogContainer';
import JourneyBreadcrumbs from '../../common/journeyBreadcrumbs/JourneyBreadcrumbs';
import DashboardNavigation, { DashboardNavigationProps } from '../../dashboardNavigation/DashboardNavigation';
import PageContent from '../../../../core/ui/content/PageContent';
import useSpaceDashboardNavigation from '../../space/spaceDashboardNavigation/useSpaceDashboardNavigation';
import { useSpace } from '../../space/SpaceContext/useSpace';
import { JourneyPath } from '../../../../main/routing/resolvers/RouteResolver';
import PageContentColumnBase from '../../../../core/ui/content/PageContentColumnBase';
import { useTranslation } from 'react-i18next';
import { KeyboardTab, Menu } from '@mui/icons-material';
import FullWidthButton from '../../../../core/ui/button/FullWidthButton';
import InfoColumn from './InfoColumn';
import TopLevelLayout from '../../../../main/ui/layout/TopLevelLayout';
import { Error404 } from '../../../../core/pages/Errors/Error404';
import FloatingActionButtons from '../../../../core/ui/button/FloatingActionButtons';
import { gutters } from '../../../../core/ui/grid/utils';
import PlatformHelpButton from '../../../../main/ui/helpButton/PlatformHelpButton';
import { NotFoundErrorBoundary } from '../../../../core/notFound/NotFoundErrorBoundary';
import { Box, Drawer, IconButton, Paper, Theme, useMediaQuery } from '@mui/material';
import GridProvider from '../../../../core/ui/grid/GridProvider';
import { GRID_COLUMNS_MOBILE } from '../../../../core/ui/grid/constants';
import SwapColors from '../../../../core/ui/palette/SwapColors';
import PageContentBlockSeamless from '../../../../core/ui/content/PageContentBlockSeamless';
import DialogActionsMenu from './DialogActionsMenu';
import Gutters from '../../../../core/ui/grid/Gutters';
import createLayoutHolder from '../../../../core/ui/layout/layoutHolder/LayoutHolder';
import PoweredBy from '../../../../main/ui/poweredBy/PoweredBy';
import DialogActionButtons from './DialogActionButtons';
import unwrapFragment from '../../../../core/ui/utils/unwrapFragment';
import { SubspaceDialog } from './SubspaceDialog';
import { DialogDefinitionProps, isDialogDef } from './DialogDefinition';
import produce from 'immer';
import WelcomeBlock from './WelcomeBlock';

export interface SubspacePageLayoutProps {
  journeyId: string | undefined;
  journeyPath: JourneyPath;
  loading?: boolean;
  unauthorizedDialogDisabled?: boolean;
  welcome?: ReactNode;
  actions?: ReactNode;
  profile?: {
    // TODO make required
    displayName: string;
  };
}

const {
  LayoutHolder: InnovationFlowHolder,
  RenderPoint: InnovationFlowRenderPoint,
  createLayout,
} = createLayoutHolder();

export const SubspaceInnovationFlow = createLayout(({ columns, children }: PropsWithChildren<{ columns: number }>) => {
  return <GridProvider columns={columns}>{children}</GridProvider>;
});

/**
 * The rationale for this context is to allow actions to be consumed by individual components,
 * and not rendered in the action list (menu or buttons).
 * Rather that handling a set of rules whether the action should be rendered in the menu or not,
 * we let the child components decide.
 */
interface ActionsProvider {
  consume(action: SubspaceDialog): DialogDefinitionProps | undefined;
  dispose(action: SubspaceDialog): void;
}

const DialogActionsContext = createContext<ActionsProvider>({
  consume: () => {
    throw new Error('Must be under DialogActionsContext');
  },
  dispose: () => {
    throw new Error('Must be under DialogActionsContext');
  },
});

export const useConsumeAction = (action: SubspaceDialog | undefined | null | false) => {
  const { consume, dispose } = useContext(DialogActionsContext);
  const actionDef = action ? consume(action) : undefined;
  useEffect(() => (action ? () => dispose(action) : undefined), [action]);
  return actionDef;
};

const Outline = (props: DashboardNavigationProps) => {
  useConsumeAction(SubspaceDialog.Outline);
  return <DashboardNavigation {...props} />;
};

const SubspacePageLayout = ({
  journeyId,
  journeyPath,
  loading = false,
  unauthorizedDialogDisabled = false,
  welcome,
  actions,
  profile,
  children,
}: PropsWithChildren<SubspacePageLayoutProps>) => {
  const { spaceId, profile: spaceProfile } = useSpace();

  const { dashboardNavigation } = useSpaceDashboardNavigation({
    spaceId,
    skip: !spaceId,
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const { t } = useTranslation();

  const isMobile = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));

  const [isInfoDrawerOpen, setIsInfoDrawerOpen] = useState(false);

  const actionsList = Children.toArray(unwrapFragment(actions));

  // Some actions are handled/consumed by individual components, in that case they aren't rendered in the action list (menu or buttons)
  const [consumedActions, setConsumedActions] = useState<Partial<Record<SubspaceDialog, true>>>({});

  const actionsProvider = useMemo<ActionsProvider>(() => {
    const actionDefinitions = actionsList.filter(isDialogDef);

    const consume = (type: SubspaceDialog) => {
      const actionDef = actionDefinitions.find(action => action.props.dialogType === type)?.props;
      if (!actionDef) {
        return;
      }
      setConsumedActions(consumed =>
        produce(consumed, record => {
          record[type] = true;
        })
      );
      return actionDef;
    };

    const restore = (type: SubspaceDialog) => {
      setConsumedActions(consumed =>
        produce(consumed, record => {
          delete record[type];
        })
      );
    };

    return { consume, dispose: restore };
  }, [actionsList, setConsumedActions]);

  const unconsumedActions = actionsList.filter(action => {
    return !isDialogDef(action) || !consumedActions[action.props.dialogType];
  });

  return (
    <NotFoundErrorBoundary
      errorComponent={
        <TopLevelLayout>
          <Error404 />
        </TopLevelLayout>
      }
    >
      <DialogActionsContext.Provider value={actionsProvider}>
        <InnovationFlowHolder>
          <TopLevelLayout
            breadcrumbs={<JourneyBreadcrumbs journeyPath={journeyPath} loading={loading} />}
            header={<ChildJourneyPageBanner journeyId={journeyId} />}
            floatingActions={
              <FloatingActionButtons
                visible
                floatingActions={<PlatformHelpButton />}
                bottom={isMobile ? gutters(2) : 0}
              />
            }
          >
            <PageContent>
              <InfoColumn collapsed={isExpanded}>
                <WelcomeBlock about={!isMobile}>{welcome}</WelcomeBlock>
                <FullWidthButton
                  startIcon={<KeyboardTab />}
                  variant="contained"
                  onClick={() => setIsExpanded(true)}
                  sx={{ '.MuiSvgIcon-root': { transform: 'rotate(180deg)' } }}
                >
                  {t('buttons.collapse')}
                </FullWidthButton>
                {!isMobile && <DialogActionButtons>{unconsumedActions}</DialogActionButtons>}
                <Outline
                  currentItemId={journeyId}
                  spaceUrl={spaceProfile.url}
                  displayName={spaceProfile.displayName}
                  dashboardNavigation={dashboardNavigation}
                />
              </InfoColumn>
              <PageContentColumnBase
                columns={isExpanded ? 12 : 9}
                flexBasis={0}
                flexGrow={1}
                flexShrink={1}
                minWidth={0}
              >
                {!isMobile && (
                  <PageContentBlockSeamless disablePadding>
                    <InnovationFlowRenderPoint />
                  </PageContentBlockSeamless>
                )}
                {children}
              </PageContentColumnBase>
            </PageContent>
            {isMobile && (
              <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1 }} elevation={3} square>
                <Gutters row padding={1} paddingBottom={0} justifyContent="space-between">
                  <IconButton onClick={() => setIsInfoDrawerOpen(true)}>
                    <Menu />
                  </IconButton>
                  <InnovationFlowRenderPoint />
                  <Box width={gutters(2)} />
                </Gutters>
                <PoweredBy compact />
              </Paper>
            )}
          </TopLevelLayout>
          <JourneyUnauthorizedDialogContainer journeyId={journeyId} loading={loading}>
            {({ vision, ...props }) => (
              <JourneyUnauthorizedDialog
                subspaceId={journeyId}
                subspaceName={profile?.displayName}
                description={vision}
                disabled={unauthorizedDialogDisabled}
                {...props}
              />
            )}
          </JourneyUnauthorizedDialogContainer>
          {isMobile && (
            <SwapColors>
              <GridProvider columns={GRID_COLUMNS_MOBILE}>
                <Drawer
                  open={isInfoDrawerOpen}
                  onClose={() => setIsInfoDrawerOpen(false)}
                  sx={{ '.MuiDrawer-paper': { width: '60vw' } }}
                >
                  <PageContentBlockSeamless>{welcome}</PageContentBlockSeamless>
                  <DialogActionsMenu onClose={() => setIsInfoDrawerOpen(false)}>{unconsumedActions}</DialogActionsMenu>
                </Drawer>
              </GridProvider>
            </SwapColors>
          )}
          {isMobile && <Box height={gutters(3)} />}
        </InnovationFlowHolder>
      </DialogActionsContext.Provider>
    </NotFoundErrorBoundary>
  );
};

export default SubspacePageLayout;
