import WhiteboardView from '../WhiteboardsManagement/WhiteboardView';
import { WhiteboardProvider } from '../containers/WhiteboardProvider';
import { useBackWithDefaultUrl } from '@/core/routing/useBackToPath';

export interface WhiteboardPageProps {
  parentUrl: string;
}

const WhiteboardPage = ({ parentUrl, ...props }: WhiteboardPageProps) => {
  const backToParentPage = useBackWithDefaultUrl(parentUrl);

  return (
    <WhiteboardProvider>
      {(entities, state) => (
        <WhiteboardView
          whiteboardId={entities.whiteboard?.id}
          backToWhiteboards={backToParentPage}
          whiteboardShareUrl={entities.whiteboard?.profile.url ?? ''}
          guestShareUrl={entities.guestShareUrl}
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
