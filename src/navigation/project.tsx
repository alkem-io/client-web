import React, { FC, useMemo } from 'react';
import { Route, Switch, useHistory, useParams, useRouteMatch } from 'react-router-dom';
import Loading from '../components/core/Loading';
import {
  Project as ProjectType,
  useProjectProfileQuery,
  useCreateProjectMutation,
  ProjectInput,
} from '../generated/graphql';
import { FourOuFour, ProjectIndex as ProjectIndexPage, ProjectNew as ProjectNewPage, PageProps } from '../pages';
import { pushError } from '../reducers/error/actions';
/*local files imports end*/

interface ProjectRootProps extends PageProps {
  opportunityId: number;
  projects: Pick<ProjectType, 'id' | 'textID' | 'name'>[] | undefined;
}

export const Project: FC<ProjectRootProps> = ({ paths, projects = [], opportunityId }) => {
  const { path } = useRouteMatch();
  return (
    <Switch>
      <Route exact path={`${path}/new`}>
        <ProjectNew paths={paths} projects={projects} opportunityId={opportunityId} />
      </Route>
      <Route exact path={`${path}/:id`}>
        <ProjectIndex paths={paths} projects={projects} opportunityId={opportunityId} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};

const ProjectNew: FC<ProjectRootProps> = ({ paths, projects, opportunityId }) => {
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
    refetchQueries: ['opportunityProfile', 'ecoverseDetails'],
    awaitRefetchQueries: true,
  });

  return (
    <ProjectNewPage
      paths={currentPaths}
      users={[]}
      loading={projectCreationLoading}
      onCreate={({ name, textID, description }) =>
        createProject({
          variables: {
            project: { name, description, textID, state: 'new' },
            opportunityID: opportunityId,
          },
        })
      }
    />
  );
};

const ProjectIndex: FC<ProjectRootProps> = ({ paths, projects = [] }) => {
  const { path, url } = useRouteMatch();
  const { id } = useParams<{ id: string }>();
  const target = projects?.find(x => x.textID === id);

  const { data: query, loading: projectLoading } = useProjectProfileQuery({
    variables: { id: Number(target?.id) },
  });

  const { project } = query || {};

  const currentPaths = useMemo(() => (project ? [...paths, { value: url, name: project.name, real: true }] : paths), [
    paths,
    id,
    project,
  ]);

  const loading = projectLoading;

  if (loading) {
    return <Loading />;
  }

  if (!project) {
    return <FourOuFour />;
  }

  return <ProjectIndexPage paths={currentPaths} project={project as ProjectType} users={[]} />;
};
