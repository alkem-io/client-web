import useBackToParentPage from '@/core/routing/deprecated/useBackToParentPage';
import { useCalloutIdQuery } from '@/core/apollo/generated/apollo-hooks';
import WhiteboardView from '../WhiteboardsManagement/WhiteboardView';
import { WhiteboardProvider } from '../containers/WhiteboardProvider';

export interface WhiteboardPageProps {
  collaborationId: string | undefined;
  whiteboardNameId: string;
  calloutNameId: string;
  parentUrl: string;
}

const WhiteboardPage = ({
  collaborationId,
  whiteboardNameId,
  parentUrl,
  calloutNameId,
  ...props
}: WhiteboardPageProps) => {
  const [backToExplore] = useBackToParentPage(parentUrl, { keepScroll: true });
  const backToWhiteboards = () => backToExplore();

  const { data } = useCalloutIdQuery({
    variables: {
      calloutNameId,
      collaborationId: collaborationId!,
    },
    skip: !calloutNameId || !collaborationId,
  });

  const calloutId = data?.lookup.collaboration?.calloutsSet.callouts?.[0].id;

  return (
    <WhiteboardProvider whiteboardNameId={whiteboardNameId} calloutId={calloutId}>
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
