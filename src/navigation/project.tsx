import React, { FC, useMemo } from 'react';
import { Route, Switch, useHistory, useParams, useRouteMatch } from 'react-router-dom';
import Loading from '../components/core/Loading';
import { useCreateProjectMutation, useProjectProfileQuery } from '../generated/graphql';
import { FourOuFour, PageProps, ProjectIndex as ProjectIndexPage, ProjectNew as ProjectNewPage } from '../pages';
import { pushError } from '../reducers/error/actions';
import { Project as ProjectType } from '../types/graphql-schema';
import RestrictedRoute from './route.extensions';
/*local files imports end*/

interface ProjectRootProps extends PageProps {
  opportunityId: number;
  projects: Pick<ProjectType, 'id' | 'textID' | 'name'>[] | undefined;
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

  const currentPaths = useMemo(() => [...paths, { value: url, name: 'New project', real: true }], [paths]);
  const [createProject, { loading: projectCreationLoading }] = useCreateProjectMutation({
    onCompleted: ({ createProject: project }) => {
      history.push(`${paths[paths.length - 1].value}/projects/${project.textID}`);
    },
    onError: ({ message }) => {
      pushError(new Error(message));
    },
    refetchQueries: ['opportunityProfile', 'challengeProfile', 'ecoverseDetails'],
    awaitRefetchQueries: true,
  });

  // need to add validation for project name & textID
  return (
    <ProjectNewPage
      paths={currentPaths}
      users={[]}
      loading={projectCreationLoading}
      onCreate={({ name, textID, description }) =>
        createProject({
          variables: {
            input: {
              opportunityID: opportunityId,
              name,
              description,
              textID,
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
  const target = projects?.find(x => x.textID === id);

  const { data: query, loading: projectLoading } = useProjectProfileQuery({
    variables: { id: target?.id || '' },
  });

  const project = query?.ecoverse.project;

  const currentPaths = useMemo(() => (project ? [...paths, { value: url, name: project.name, real: true }] : paths), [
    paths,
    id,
    project,
  ]);

  if (projectLoading) {
    return <Loading text={'Loading project ...'} />;
  }

  if (!project) {
    return <FourOuFour />;
  }

  return <ProjectIndexPage paths={currentPaths} project={project as ProjectType} users={[]} />;
};
