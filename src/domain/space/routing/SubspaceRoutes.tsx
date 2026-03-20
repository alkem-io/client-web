import { createContext, type Dispatch, type SetStateAction, useState } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { Error404 } from '@/core/pages/Errors/Error404';
import Redirect from '@/core/routing/Redirect';
import Loading from '@/core/ui/loading/Loading';
import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';
import { useSubSpace } from '@/domain/space/hooks/useSubSpace';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import { nameOfUrl } from '@/main/routing/urlParams';
import TopLevelLayout from '@/main/ui/layout/TopLevelLayout';
import SubspaceAboutPage from '../about/SubspaceAboutPage';
import { SubspaceDialog } from '../components/subspaces/SubspaceDialog';
import SubspaceHomePage from '../layout/flowLayout/SubspaceHomePage';
import { SubspacePageLayout } from '../layout/SubspacePageLayout';
import SubspaceCalloutPage from '../pages/SubspaceCalloutPage';
import SubspaceSettingsRoute from './SubspaceSettingsRoute';
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
        <Route path="*" element={<Navigate to={`../${EntityPageSection.About}`} replace={true} />} />
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
            <Route path={EntityPageSection.Dashboard} element={<Navigate replace={true} to="/" />} />

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
            <Route index={true} element={<SubspaceHomePage />} />
            <Route index={true} path={`:dialog?/:${nameOfUrl.calendarEventNameId}?/*`} element={<SubspaceHomePage />} />

            {/* define l2 subspace routes explicitly  although they are recursive */}
            <Route path={`/opportunities/:${nameOfUrl.subsubspaceNameId}/*`}>
              <Route path="explore/*" element={<Redirect to={EntityPageSection.Contribute} />} />
              <Route path={EntityPageSection.Dashboard} element={<Navigate replace={true} to="/" />} />
              <Route path={SubspaceDialog.About} element={<SubspaceAboutPage />} />
              <Route
                path={`${EntityPageSection.Collaboration}/:${nameOfUrl.calloutNameId}`}
                element={<SubspaceCalloutPage />}
              />
              <Route
                path={`${EntityPageSection.Collaboration}/:${nameOfUrl.calloutNameId}/*`}
                element={<SubspaceCalloutPage />}
              />
              <Route index={true} element={<SubspaceHomePage />} />
              <Route
                index={true}
                path={`:dialog?/:${nameOfUrl.calendarEventNameId}?/*`}
                element={<SubspaceHomePage />}
              />
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
