import React, { FC, useMemo } from 'react';
import { Route, Switch, useHistory, useParams, useRouteMatch } from 'react-router-dom';
import Loading from '../components/core/Loading';
import { useCreateProjectMutation, useProjectProfileQuery } from '../generated/graphql';
import { useEcoverse } from '../hooks/useEcoverse';
import { FourOuFour, PageProps, ProjectIndex as ProjectIndexPage, ProjectNew as ProjectNewPage } from '../pages';
import { Project as ProjectType } from '../types/graphql-schema';
import { useApolloErrorHandler } from '../hooks/useApolloErrorHandler';
import RestrictedRoute from './route.extensions';
/*local files imports end*/

interface ProjectRootProps extends PageProps {
  opportunityId: string;
  projects: Pick<ProjectType, 'id' | 'nameID' | 'displayName'>[] | undefined;
}

export const Project: FC<ProjectRootProps> = ({ paths, projects = [], opportunityId }) => {
  const { path } = useRouteMatch();
  return (
    <Switch>
      <RestrictedRoute exact path={`${path}/new`} allowedGroups={['admin']} strict={false}>
        <ProjectNew paths={paths} projects={projects} opportunityId={opportunityId} />
      </RestrictedRoute>
      <RestrictedRoute exact path={`${path}/:id`}>
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
  const { id } = useParams<{ id: string }>();
  const { ecoverseId } = useEcoverse();
  const target = projects?.find(x => x.nameID === id);

  const { data: query, loading: projectLoading } = useProjectProfileQuery({
    variables: { ecoverseId, projectId: target?.id || '' },
  });

  const project = query?.ecoverse.project;

  const currentPaths = useMemo(
    () => (project ? [...paths, { value: url, name: project.displayName, real: true }] : paths),
    [paths, id, project]
  );

  if (projectLoading) {
    return <Loading text={'Loading project ...'} />;
  }

  if (!project) {
    return <FourOuFour />;
  }

  return <ProjectIndexPage paths={currentPaths} project={project as ProjectType} users={[]} />;
};
