import CalloutView, { CalloutViewProps } from '../../collaboration/callout/CalloutView/CalloutView';
import { useCalloutTemplatePreviewQuery } from '../../../core/apollo/generated/apollo-hooks';
import { Identifiable } from '../../../core/utils/Identifiable';

interface CalloutTemplatePreviewProps {
  template?: Identifiable;
}

const CalloutTemplatePreview = ({ template }: CalloutTemplatePreviewProps) => {
  const { data } = useCalloutTemplatePreviewQuery({
    variables: {
      calloutTemplateId: template?.id!,
    },
    skip: !template?.id,
  });

  if (!data) {
    return null;
  }

  return (
    <CalloutView
      callout={data?.lookup.calloutTemplate as CalloutViewProps['callout']}
      journeyTypeName="space"
      calloutNames={[]}
      contributionsCount={0}
      calloutUri=""
      spaceNameId=""
    />
  );
};

export default CalloutTemplatePreview;
