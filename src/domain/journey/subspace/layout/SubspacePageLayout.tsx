import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { NotFoundErrorBoundary } from '@/core/notFound/NotFoundErrorBoundary';
import { Error404 } from '@/core/pages/Errors/Error404';
import ButtonWithTooltip from '@/core/ui/button/ButtonWithTooltip';
import FloatingActionButtons from '@/core/ui/button/FloatingActionButtons';
import FullWidthButton from '@/core/ui/button/FullWidthButton';
import PageContent from '@/core/ui/content/PageContent';
import PageContentBlockSeamless from '@/core/ui/content/PageContentBlockSeamless';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import PageContentColumnBase from '@/core/ui/content/PageContentColumnBase';
import GridProvider from '@/core/ui/grid/GridProvider';
import Gutters from '@/core/ui/grid/Gutters';
import { GRID_COLUMNS_MOBILE } from '@/core/ui/grid/constants';
import { gutters } from '@/core/ui/grid/utils';
import createLayoutHolder from '@/core/ui/layout/layoutHolder/LayoutHolder';
import { UrlBaseProvider } from '@/core/ui/link/UrlBase';
import SwapColors from '@/core/ui/palette/SwapColors';
import { theme } from '@/core/ui/themes/default/Theme';
import unwrapFragment from '@/core/ui/utils/unwrapFragment';
import ApplicationButtonContainer from '@/domain/access/ApplicationsAndInvitations/ApplicationButtonContainer';
import ApplicationButton from '@/domain/community/application/applicationButton/ApplicationButton';
import ChildJourneyPageBanner from '@/domain/journey/common/childJourneyPageBanner/ChildJourneyPageBanner';
import JourneyBreadcrumbs from '@/domain/journey/common/journeyBreadcrumbs/JourneyBreadcrumbs';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import { JourneyPath } from '@/main/routing/urlResolver/UrlResolverProvider';
import PlatformHelpButton from '@/main/ui/helpButton/PlatformHelpButton';
import TopLevelLayout from '@/main/ui/layout/TopLevelLayout';
import PoweredBy from '@/main/ui/poweredBy/PoweredBy';
import { KeyboardTab, Menu } from '@mui/icons-material';
import { Box, Drawer, IconButton, Paper, Theme, useMediaQuery } from '@mui/material';
import produce from 'immer';
import { Children, PropsWithChildren, ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DialogActionButtons from './DialogActionButtons';
import DialogActionsMenu from './DialogActionsMenu';
import { DialogDefinitionProps, isDialogDef } from './DialogDefinition';
import InfoColumn from './InfoColumn';
import { SubspaceDialog } from './SubspaceDialog';
import WelcomeBlock from './WelcomeBlock';
import useAboutRedirect from '@/core/routing/useAboutRedirect';

export interface SubspacePageLayoutProps {
  journeyId: string | undefined;
  parentSpaceId: string | undefined;
  levelZeroSpaceId: string | undefined;
  spaceLevel: SpaceLevel | undefined;
  journeyPath: JourneyPath | undefined;
  spaceUrl?: string | undefined; // TODO make required
  loading?: boolean;
  unauthorizedDialogDisabled?: boolean;
  welcome?: ReactNode;
  actions?: ReactNode;
  infoColumnChildren?: ReactNode;
}

const {
  LayoutHolder: InnovationFlowHolder,
  RenderPoint: InnovationFlowRenderPoint,
  createLayout,
} = createLayoutHolder();

export const SubspaceInnovationFlow = createLayout(({ children }: PropsWithChildren) => {
  return <>{children}</>;
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
  consume: () => undefined,
  dispose: () => {},
});

export const useConsumeAction = (action: SubspaceDialog | undefined | null | false) => {
  const { consume, dispose } = useContext(DialogActionsContext);
  const actionDef = action ? consume(action) : undefined;
  useEffect(() => (action ? () => dispose(action) : undefined), [action]);
  return actionDef;
};

const MENU_STATE_KEY = 'menuState';
enum MenuState {
  EXPANDED = 'expanded',
  COLLAPSED = 'collapsed',
}

const SubspacePageLayout = ({
  journeyId,
  parentSpaceId,
  levelZeroSpaceId,
  journeyPath,
  spaceLevel,
  spaceUrl: journeyUrl,
  loading = false,
  welcome,
  actions,
  children,
  infoColumnChildren,
}: PropsWithChildren<SubspacePageLayoutProps>) => {
  const [isCollapsed, setIsCollapsed] = useState(localStorage.getItem(MENU_STATE_KEY) === MenuState.COLLAPSED || false);

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

  const hasExtendedApplicationButton = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));

  useAboutRedirect({ spaceId: journeyId, skip: !journeyId });

  return (
    <StorageConfigContextProvider locationType="journey" spaceId={journeyId}>
      <NotFoundErrorBoundary
        errorComponent={
          <TopLevelLayout>
            <Error404 />
          </TopLevelLayout>
        }
      >
        <UrlBaseProvider url={journeyUrl}>
          <DialogActionsContext.Provider value={actionsProvider}>
            <InnovationFlowHolder>
              <TopLevelLayout
                breadcrumbs={<JourneyBreadcrumbs journeyPath={journeyPath} loading={loading} />}
                header={<ChildJourneyPageBanner journeyId={journeyId} levelZeroSpaceId={levelZeroSpaceId} />}
                floatingActions={
                  <FloatingActionButtons
                    visible
                    floatingActions={<PlatformHelpButton />}
                    bottom={isMobile ? gutters(2) : 0}
                  />
                }
              >
                <PageContent>
                  <InfoColumn collapsed={isCollapsed}>
                    {!isCollapsed && <WelcomeBlock about={!isMobile}>{welcome}</WelcomeBlock>}
                    {!isCollapsed && (
                      <FullWidthButton
                        startIcon={<KeyboardTab />}
                        variant="contained"
                        onClick={() => {
                          setIsCollapsed(true);
                          localStorage.setItem(MENU_STATE_KEY, MenuState.COLLAPSED);
                        }}
                        sx={{ '.MuiSvgIcon-root': { transform: 'rotate(180deg)' } }}
                      >
                        {t('buttons.collapse')}
                      </FullWidthButton>
                    )}
                    <DialogActionButtons column={isCollapsed}>
                      {unconsumedActions}
                      {isCollapsed && (
                        <ButtonWithTooltip
                          tooltip={t('buttons.expand')}
                          tooltipPlacement="right"
                          iconButton
                          onClick={() => {
                            setIsCollapsed(false);
                            localStorage.setItem(MENU_STATE_KEY, MenuState.EXPANDED);
                          }}
                        >
                          <KeyboardTab />
                        </ButtonWithTooltip>
                      )}
                    </DialogActionButtons>
                    {infoColumnChildren}
                  </InfoColumn>
                  <PageContentColumnBase
                    columns={isCollapsed ? 12 : 9}
                    flexBasis={0}
                    flexGrow={1}
                    flexShrink={1}
                    minWidth={0}
                  >
                    <ApplicationButtonContainer journeyId={journeyId} parentSpaceId={parentSpaceId}>
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
                              journeyId={journeyId}
                              spaceLevel={spaceLevel}
                            />
                          </PageContentColumn>
                        );
                      }}
                    </ApplicationButtonContainer>

                    {!isMobile && (
                      <Box
                        sx={{
                          position: 'sticky',
                          top: 0,
                          marginTop: gutters(-1),
                          paddingY: gutters(1),
                          background: theme.palette.background.default,
                          width: '100%',
                          zIndex: 1,
                          boxShadow: theme => `0 6px 5px 2px ${theme.palette.background.default}`,
                        }}
                      >
                        <InnovationFlowRenderPoint />
                      </Box>
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
              {isMobile && (
                <SwapColors>
                  <GridProvider columns={GRID_COLUMNS_MOBILE}>
                    <Drawer
                      open={isInfoDrawerOpen}
                      onClose={() => setIsInfoDrawerOpen(false)}
                      sx={{ '.MuiDrawer-paper': { width: '60vw' } }}
                    >
                      <PageContentBlockSeamless>{welcome}</PageContentBlockSeamless>
                      <DialogActionsMenu onClose={() => setIsInfoDrawerOpen(false)}>
                        {unconsumedActions}
                      </DialogActionsMenu>
                    </Drawer>
                  </GridProvider>
                </SwapColors>
              )}
              {isMobile && <Box height={gutters(3)} />}
            </InnovationFlowHolder>
          </DialogActionsContext.Provider>
        </UrlBaseProvider>
      </NotFoundErrorBoundary>
    </StorageConfigContextProvider>
  );
};

export default SubspacePageLayout;
