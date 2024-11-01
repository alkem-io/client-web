import { useMemo, Children, useState, useEffect, ReactNode, useContext, createContext, PropsWithChildren } from 'react';

import produce from 'immer';
import { useTranslation } from 'react-i18next';
import { KeyboardTab, Menu } from '@mui/icons-material';
import { Box, Drawer, IconButton, Paper, Theme, useMediaQuery } from '@mui/material';

import InfoColumn from './InfoColumn';
import WelcomeBlock from './WelcomeBlock';
import DialogActionsMenu from './DialogActionsMenu';
import Gutters from '../../../../core/ui/grid/Gutters';
import DialogActionButtons from './DialogActionButtons';
import SwapColors from '../../../../core/ui/palette/SwapColors';
import PoweredBy from '../../../../main/ui/poweredBy/PoweredBy';
import GridProvider from '../../../../core/ui/grid/GridProvider';
import { Error404 } from '../../../../core/pages/Errors/Error404';
import PageContent from '../../../../core/ui/content/PageContent';
import { UrlBaseProvider } from '../../../../core/ui/link/UrlBase';
import TopLevelLayout from '../../../../main/ui/layout/TopLevelLayout';
import FullWidthButton from '../../../../core/ui/button/FullWidthButton';
import PageContentColumn from '../../../../core/ui/content/PageContentColumn';
import PlatformHelpButton from '../../../../main/ui/helpButton/PlatformHelpButton';
import JourneyBreadcrumbs from '../../common/journeyBreadcrumbs/JourneyBreadcrumbs';
import PageContentColumnBase from '../../../../core/ui/content/PageContentColumnBase';
import { NotFoundErrorBoundary } from '../../../../core/notFound/NotFoundErrorBoundary';
import PageContentBlockSeamless from '../../../../core/ui/content/PageContentBlockSeamless';
import ChildJourneyPageBanner from '../../common/childJourneyPageBanner/ChildJourneyPageBanner';
import ApplicationButton from '../../../community/application/applicationButton/ApplicationButton';
import { StorageConfigContextProvider } from '../../../storage/StorageBucket/StorageConfigContext';
import JourneyUnauthorizedDialog from '../../common/JourneyUnauthorizedDialog/JourneyUnauthorizedDialog';
import ApplicationButtonContainer from '../../../community/application/containers/ApplicationButtonContainer';
import JourneyUnauthorizedDialogContainer from '../../common/JourneyUnauthorizedDialog/JourneyUnauthorizedDialogContainer';

import { SubspaceDialog } from './SubspaceDialog';
import { gutters } from '../../../../core/ui/grid/utils';
import { theme } from '../../../../core/ui/themes/default/Theme';
import unwrapFragment from '../../../../core/ui/utils/unwrapFragment';
import { GRID_COLUMNS_MOBILE } from '../../../../core/ui/grid/constants';
import ButtonWithTooltip from '../../../../core/ui/button/ButtonWithTooltip';
import { SpaceLevel } from '../../../../core/apollo/generated/graphql-schema';
import { isDialogDef, type DialogDefinitionProps } from './DialogDefinition';
import { type SpaceReadAccess } from '../../common/authorization/useCanReadSpace';
import { type JourneyPath } from '../../../../main/routing/resolvers/RouteResolver';
import FloatingActionButtons from '../../../../core/ui/button/FloatingActionButtons';
import createLayoutHolder from '../../../../core/ui/layout/layoutHolder/LayoutHolder';

enum MenuState {
  EXPANDED = 'expanded',
  COLLAPSED = 'collapsed',
}

const {
  LayoutHolder: InnovationFlowHolder,
  RenderPoint: InnovationFlowRenderPoint,
  createLayout,
} = createLayoutHolder();

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

const SubspacePageLayout = ({
  actions,
  welcome,
  children,
  journeyId,
  journeyUrl,
  journeyPath,
  spaceReadAccess,
  loading = false,
  parentJourneyId,
  infoColumnChildren,
  unauthorizedDialogDisabled = false,
}: PropsWithChildren<SubspacePageLayoutProps>) => {
  const [isInfoDrawerOpen, setIsInfoDrawerOpen] = useState(false);
  // Some actions are handled/consumed by individual components, in that case they aren't rendered in the action list (menu or buttons)
  const [consumedActions, setConsumedActions] = useState<Partial<Record<SubspaceDialog, true>>>({});
  const [isCollapsed, setIsCollapsed] = useState(localStorage.getItem(MENU_STATE_KEY) === MenuState.COLLAPSED || false);

  const { t } = useTranslation();

  const actionsList = Children.toArray(unwrapFragment(actions));

  const isMobile = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));

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
  let spaceLevel = SpaceLevel.Space;
  if (journeyPath.length === 2) {
    spaceLevel = SpaceLevel.Challenge;
  } else if (journeyPath.length === 3) {
    spaceLevel = SpaceLevel.Opportunity;
  }

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
                header={<ChildJourneyPageBanner journeyId={journeyId} />}
                floatingActions={
                  <FloatingActionButtons
                    visible
                    bottom={isMobile ? gutters(2) : 0}
                    floatingActions={<PlatformHelpButton />}
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
                          iconButton
                          tooltipPlacement="right"
                          tooltip={t('buttons.expand')}
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
                    <ApplicationButtonContainer journeyId={journeyId} parentSpaceId={parentJourneyId}>
                      {({ applicationButtonProps }, { loading }) => {
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

              <JourneyUnauthorizedDialogContainer {...spaceReadAccess} journeyId={journeyId}>
                {({ vision, ...props }) => (
                  <JourneyUnauthorizedDialog
                    journeyId={journeyId}
                    parentSpaceId={parentJourneyId}
                    description={vision}
                    disabled={unauthorizedDialogDisabled}
                    spaceLevel={spaceLevel}
                    {...props}
                  />
                )}
              </JourneyUnauthorizedDialogContainer>

              {isMobile && (
                <SwapColors>
                  <GridProvider columns={GRID_COLUMNS_MOBILE}>
                    <Drawer
                      open={isInfoDrawerOpen}
                      sx={{ '.MuiDrawer-paper': { width: '60vw' } }}
                      onClose={() => setIsInfoDrawerOpen(false)}
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

export const SubspaceInnovationFlow = createLayout(({ children }: PropsWithChildren<{}>) => {
  return <>{children}</>;
});

export interface SubspacePageLayoutProps {
  journeyPath: JourneyPath;
  journeyId: string | undefined;
  spaceReadAccess: SpaceReadAccess;
  parentJourneyId: string | undefined;

  loading?: boolean;
  welcome?: ReactNode;
  actions?: ReactNode;
  infoColumnChildren?: ReactNode;
  journeyUrl?: string | undefined; // TODO make required
  unauthorizedDialogDisabled?: boolean;
}

/**
 * The rationale for this context is to allow actions to be consumed by individual components,
 * and not rendered in the action list (menu or buttons).
 * Rather that handling a set of rules whether the action should be rendered in the menu or not,
 * we let the child components decide.
 */
type ActionsProvider = {
  dispose(action: SubspaceDialog): void;
  consume(action: SubspaceDialog): DialogDefinitionProps | undefined;
};
