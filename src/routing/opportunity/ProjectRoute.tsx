import React, { FC, useMemo } from 'react';
import { Route, Routes, useNavigate, useResolvedPath } from 'react-router-dom';
import Loading from '../../components/core/Loading/Loading';
import { useApolloErrorHandler, useHub, useOpportunity, useUrlParams } from '../../hooks';
import {
  ProjectDetailsFragmentDoc,
  useCreateProjectMutation,
  useProjectProfileQuery,
} from '../../hooks/generated/graphql';
import { Project as ProjectType } from '../../models/graphql-schema';
import { Error404, PageProps, ProjectIndex as ProjectIndexPage, ProjectNew as ProjectNewPage } from '../../pages';
import RestrictedRoute from '../RestrictedRoute';
import { nameOfUrl } from '../url-params';
import OpportunityTabs from './OpportunityTabs';

interface ProjectRootProps extends PageProps {}

export const ProjectRoute: FC<ProjectRootProps> = ({ paths }) => {
  const [lastPath] = paths.slice(-1);
  const projectsPath = `${lastPath.value}/projects`;
  const currentPaths = useMemo(() => [...paths, { value: projectsPath, name: 'projects', real: true }], [paths]);
  const { hubNameId, challengeNameId, opportunityNameId, permissions } = useOpportunity();

  return (
    <Routes>
      <Route
        path={'new'}
        element={
          <RestrictedRoute requiredCredentials={[]}>
            <OpportunityTabs
              communityReadAccess={permissions.communityReadAccess}
              viewerCanUpdate={permissions.viewerCanUpdate}
              hubNameId={hubNameId}
              challengeNameId={challengeNameId}
              opportunityNameId={opportunityNameId}
            />
            <ProjectNewRoute paths={currentPaths} />
          </RestrictedRoute>
        }
      />
      <Route
        path={`:${nameOfUrl.projectNameId}`}
        element={
          <RestrictedRoute>
            <OpportunityTabs
              communityReadAccess={permissions.communityReadAccess}
              viewerCanUpdate={permissions.viewerCanUpdate}
              hubNameId={hubNameId}
              challengeNameId={challengeNameId}
              opportunityNameId={opportunityNameId}
            />
            <ProjectIndex paths={currentPaths} />
          </RestrictedRoute>
        }
      />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};

export const ProjectNewRoute: FC<ProjectRootProps> = ({ paths }) => {
  const { pathname: url } = useResolvedPath('.');
  const navigate = useNavigate();
  const handleError = useApolloErrorHandler();
  const { opportunityId } = useOpportunity();
  const currentPaths = useMemo(() => [...paths, { value: '/new', name: 'New project', real: true }], [paths]);
  const [createProject, { loading: projectCreationLoading }] = useCreateProjectMutation({
    onCompleted: ({ createProject: _project }) => {
      navigate(url.split('/').reverse().slice(1).reverse().join('/'), { replace: true });
    },
    onError: handleError,
    refetchQueries: ['opportunityProfile', 'challengeProfile', 'hubDetails'],
    awaitRefetchQueries: true,
  });

  // need to add validation for project name & nameID
  return (
    <ProjectNewPage
      paths={currentPaths}
      users={[]}
      loading={projectCreationLoading}
      onCreate={({ displayName, nameID, description }) =>
        createProject({
          variables: {
            input: {
              opportunityID: opportunityId,
              displayName,
              description,
              nameID,
            },
          },
          update: (cache, { data }) => {
            const newProject = data?.createProject;
            cache.modify({
              id: cache.identify({
                __typename: 'Opportunity', // TODO: Find a way to generate it.
                id: opportunityId,
              }),
              fields: {
                projects(existringProjects = []) {
                  const newProjectRef = cache.writeFragment({
                    data: newProject,
                    fragment: ProjectDetailsFragmentDoc,
                  });
                  return [...existringProjects, newProjectRef];
                },
              },
            });
          },
        })
      }
    />
  );
};

const ProjectIndex: FC<ProjectRootProps> = ({ paths }) => {
  const { pathname: url } = useResolvedPath('.');
  const { projectNameId = '' } = useUrlParams();
  const { hubNameId } = useHub();

  const { data: query, loading: projectLoading } = useProjectProfileQuery({
    variables: { hubId: hubNameId, projectId: projectNameId },
  });

  const project = query?.hub.project;

  const currentPaths = useMemo(
    () => (project ? [...paths, { value: url, name: project.displayName, real: true }] : paths),
    [paths, projectNameId, project]
  );

  if (projectLoading) {
    return <Loading text={'Loading project ...'} />;
  }

  if (!project) {
    return <Error404 />;
  }

  return <ProjectIndexPage paths={currentPaths} project={project as ProjectType} users={[]} />;
};
