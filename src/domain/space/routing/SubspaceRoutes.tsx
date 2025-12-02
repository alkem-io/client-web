import { Dispatch, SetStateAction, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Outlet, Navigate } from 'react-router-dom';
import { Error404 } from '@/core/pages/Errors/Error404';
import { nameOfUrl } from '@/main/routing/urlParams';
import SubspaceAboutPage from '../about/SubspaceAboutPage';
import SubspaceHomePage from '../layout/flowLayout/SubspaceHomePage';
import Redirect from '@/core/routing/Redirect';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import SubspaceCalloutPage from '../pages/SubspaceCalloutPage';
import { SubspaceDialog } from '../components/subspaces/SubspaceDialog';
import SubspaceSettingsRoute from './SubspaceSettingsRoute';
import { useSubSpace } from '@/domain/space/hooks/useSubSpace';
import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';
import { SubspacePageLayout } from '../layout/SubspacePageLayout';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { createContext } from 'react';
import TopLevelLayout from '@/main/ui/layout/TopLevelLayout';
import Loading from '@/core/ui/loading/Loading';
import { NavigateWithOrigin } from '@/core/routing/useBackToPath';
export interface InnovationFlowStateContextProps {
  selectedInnovationFlowState?: string;
  setSelectedInnovationFlowState?: Dispatch<SetStateAction<string>>;
}

export const InnovationFlowStateContext = createContext<InnovationFlowStateContextProps>({});
const InnovationFlowStateContextProvider = ({ children }) => {
  const [selectedInnovationFlowState, setSelectedInnovationFlowState] = useState('');

  return (
    <InnovationFlowStateContext value={{ selectedInnovationFlowState, setSelectedInnovationFlowState }}>
      {children}
    </InnovationFlowStateContext>
  );
};

const SubspaceRoute = ({ level = SpaceLevel.L1 }: { level?: SpaceLevel }) => {
  const { subspace, permissions, loading } = useSubSpace();
  if (loading) {
    return <Loading />;
  }
  if (subspace.id && !loading && !permissions.canRead) {
    return (
      <Routes>
        <Route path={EntityPageSection.About} element={<SubspaceAboutPage />} />
        <Route path="*" element={<NavigateWithOrigin to={`../${EntityPageSection.About}`} replace />} />
      </Routes>
    );
  }

  return (
    <StorageConfigContextProvider locationType="space" spaceId={subspace.id}>
      <InnovationFlowStateContextProvider>
        <Routes>
          {/* subspace settings page doesn't need any subpsace layout - it uses the level 0 space page banner */}
          <Route path={`/${SubspaceDialog.Settings}/*`} element={<SubspaceSettingsRoute />} />
          {/* match level 2 settings page early as well */}
          <Route
            path={`opportunities/:${nameOfUrl.subsubspaceNameId}/${SubspaceDialog.Settings}/*`}
            element={<SubspaceSettingsRoute />}
          />

          {/* level 2 space routes are recusive in relation to level 1; so do not add a second layout and just display the page */}
          <Route element={level === SpaceLevel.L2 ? <Outlet /> : <SubspacePageLayout />}>
            {/* legacy routes */}
            <Route path="explore/*" element={<Redirect to={EntityPageSection.Contribute} />} />
            <Route path={EntityPageSection.Dashboard} element={<Navigate replace to="/" />} />

            {/* current routes */}
            <Route path={SubspaceDialog.About} element={<SubspaceAboutPage />} />
            <Route
              path={`${EntityPageSection.Collaboration}/:${nameOfUrl.calloutNameId}`}
              element={<SubspaceCalloutPage />}
            />
            <Route
              path={`${EntityPageSection.Collaboration}/:${nameOfUrl.calloutNameId}/*`}
              element={<SubspaceCalloutPage />}
            />
            <Route index element={<SubspaceHomePage />} />
            <Route index path={`:dialog?/:${nameOfUrl.calendarEventNameId}?/*`} element={<SubspaceHomePage />} />

            {/* define l2 subspace routes explicitly  although they are recursive */}
            <Route path={`/opportunities/:${nameOfUrl.subsubspaceNameId}/*`}>
              <Route path="explore/*" element={<Redirect to={EntityPageSection.Contribute} />} />
              <Route path={EntityPageSection.Dashboard} element={<Navigate replace to="/" />} />
              <Route path={SubspaceDialog.About} element={<SubspaceAboutPage />} />
              <Route
                path={`${EntityPageSection.Collaboration}/:${nameOfUrl.calloutNameId}`}
                element={<SubspaceCalloutPage />}
              />
              <Route
                path={`${EntityPageSection.Collaboration}/:${nameOfUrl.calloutNameId}/*`}
                element={<SubspaceCalloutPage />}
              />
              <Route index element={<SubspaceHomePage />} />
              <Route index path={`:dialog?/:${nameOfUrl.calendarEventNameId}?/*`} element={<SubspaceHomePage />} />
            </Route>
            <Route
              path="*"
              element={
                <TopLevelLayout>
                  <Error404 />
                </TopLevelLayout>
              }
            />
          </Route>
        </Routes>
      </InnovationFlowStateContextProvider>
    </StorageConfigContextProvider>
  );
};

export default SubspaceRoute;
