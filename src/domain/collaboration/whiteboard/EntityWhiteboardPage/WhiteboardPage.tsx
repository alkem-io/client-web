import useBackToParentPage from '@/_deprecatedToKeep/useBackToParentPage';
import WhiteboardView from '../WhiteboardsManagement/WhiteboardView';
import { WhiteboardProvider } from '../containers/WhiteboardProvider';

export interface WhiteboardPageProps {
  parentUrl: string;
}

const WhiteboardPage = ({ parentUrl, ...props }: WhiteboardPageProps) => {
  const [backToExplore] = useBackToParentPage(parentUrl, { keepScroll: true });
  const backToWhiteboards = () => backToExplore();

  return (
    <WhiteboardProvider>
      {(entities, state) => (
        <WhiteboardView
          whiteboardId={entities.whiteboard?.id}
          backToWhiteboards={backToWhiteboards}
          whiteboardShareUrl={entities.whiteboard?.profile.url ?? ''}
          whiteboard={entities.whiteboard}
          authorization={entities.whiteboard?.authorization}
          loadingWhiteboards={state.loadingWhiteboards}
          {...props}
        />
      )}
    </WhiteboardProvider>
  );
};

export default WhiteboardPage;
