import React, { FC, useMemo } from 'react';
import { Route, Switch, useHistory, useRouteMatch } from 'react-router-dom';
import Loading from '../../components/core/Loading/Loading';
import { useApolloErrorHandler, useEcoverse, useOpportunity, useUrlParams } from '../../hooks';
import {
  ProjectDetailsFragmentDoc,
  useCreateProjectMutation,
  useProjectProfileQuery,
} from '../../hooks/generated/graphql';
import { Project as ProjectType } from '../../models/graphql-schema';
import { Error404, PageProps, ProjectIndex as ProjectIndexPage, ProjectNew as ProjectNewPage } from '../../pages';
import RestrictedRoute from '../RestrictedRoute';
import { nameOfUrl } from '../url-params';

interface ProjectRootProps extends PageProps {}

export const ProjectRoute: FC<ProjectRootProps> = ({ paths }) => {
  const { path } = useRouteMatch();
  return (
    <Switch>
      <Route
        exact
        path={`${path}new`}
        strict={false}
        render={() => (
          <RestrictedRoute requiredCredentials={[]}>
            <ProjectNewRoute paths={paths} />
          </RestrictedRoute>
        )}
      />

      <Route
        exact
        path={`${path}:${nameOfUrl.projectNameId}`}
        render={() => (
          <RestrictedRoute>
            <ProjectIndex paths={paths} />
          </RestrictedRoute>
        )}
      />
      <Route path="*">
        <Error404 />
      </Route>
    </Switch>
  );
};

export const ProjectNewRoute: FC<ProjectRootProps> = ({ paths }) => {
  const { url } = useRouteMatch();
  const history = useHistory();
  const handleError = useApolloErrorHandler();
  const { opportunityId } = useOpportunity();
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'New project', real: true }], [paths]);
  const [createProject, { loading: projectCreationLoading }] = useCreateProjectMutation({
    onCompleted: ({ createProject: _project }) => {
      history.replace(url.split('/').reverse().slice(1).reverse().join('/'));
    },
    onError: handleError,
    refetchQueries: ['opportunityProfile', 'challengeProfile', 'ecoverseDetails'],
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
  const { url } = useRouteMatch();
  const { projectNameId } = useUrlParams();
  const { ecoverseNameId } = useEcoverse();

  const { data: query, loading: projectLoading } = useProjectProfileQuery({
    variables: { ecoverseId: ecoverseNameId, projectId: projectNameId },
  });

  const project = query?.ecoverse.project;

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
