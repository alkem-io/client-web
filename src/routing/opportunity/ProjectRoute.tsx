import React, { FC, useMemo } from 'react';
import { Route, Switch, useHistory, useRouteMatch } from 'react-router-dom';
import Loading from '../../components/core/Loading/Loading';
import { useCreateProjectMutation, useProjectProfileQuery } from '../../hooks/generated/graphql';
import { useEcoverse, useUrlParams } from '../../hooks';
import { FourOuFour, PageProps, ProjectIndex as ProjectIndexPage, ProjectNew as ProjectNewPage } from '../../pages';
import { Project as ProjectType } from '../../models/graphql-schema';
import { useApolloErrorHandler } from '../../hooks';
import RestrictedRoute from '../route.extensions';
import { nameOfUrl } from '../url-params';
/*local files imports end*/

interface ProjectRootProps extends PageProps {
  opportunityId: string;
  projects: Pick<ProjectType, 'id' | 'nameID' | 'displayName'>[] | undefined;
}

export const ProjectRoute: FC<ProjectRootProps> = ({ paths, projects = [], opportunityId }) => {
  const { path } = useRouteMatch();
  return (
    <Switch>
      {
        // TODO: set correct credentials
      }
      <RestrictedRoute exact path={`${path}/new`} requiredCredentials={[]} strict={false}>
        <ProjectNew paths={paths} projects={projects} opportunityId={opportunityId} />
      </RestrictedRoute>
      <RestrictedRoute exact path={`${path}/:${nameOfUrl.projectId}`}>
        <ProjectIndex paths={paths} projects={projects} opportunityId={opportunityId} />
      </RestrictedRoute>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};

const ProjectNew: FC<ProjectRootProps> = ({ paths, opportunityId }) => {
  const { url } = useRouteMatch();
  const history = useHistory();
  const handleError = useApolloErrorHandler();

  const currentPaths = useMemo(() => [...paths, { value: url, name: 'New project', real: true }], [paths]);
  const [createProject, { loading: projectCreationLoading }] = useCreateProjectMutation({
    onCompleted: ({ createProject: project }) => {
      history.push(`${paths[paths.length - 1].value}/projects/${project.nameID}`);
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
        })
      }
    />
  );
};

const ProjectIndex: FC<ProjectRootProps> = ({ paths, projects = [] }) => {
  const { url } = useRouteMatch();
  const { projectId } = useUrlParams();
  const { ecoverseNameId } = useEcoverse();
  const target = projects?.find(x => x.nameID === projectId);

  const { data: query, loading: projectLoading } = useProjectProfileQuery({
    variables: { ecoverseId: ecoverseNameId, projectId: target?.id || '' },
  });

  const project = query?.ecoverse.project;

  const currentPaths = useMemo(
    () => (project ? [...paths, { value: url, name: project.displayName, real: true }] : paths),
    [paths, projectId, project]
  );

  if (projectLoading) {
    return <Loading text={'Loading project ...'} />;
  }

  if (!project) {
    return <FourOuFour />;
  }

  return <ProjectIndexPage paths={currentPaths} project={project as ProjectType} users={[]} />;
};
