import { SpaceAboutApplyButton } from '@/crd/components/space/SpaceAboutApplyButton';
import { useSpaceApplyFlow } from './useSpaceApplyFlow';

type SpaceApplyButtonConnectorProps = {
  spaceId: string;
  spaceProfileUrl: string;
  communityName: string;
  parentSpaceId?: string;
  className?: string;
};

export function SpaceApplyButtonConnector({
  spaceId,
  spaceProfileUrl,
  communityName,
  parentSpaceId,
  className,
}: SpaceApplyButtonConnectorProps) {
  const { loading, isMember, buttonProps, dialogs } = useSpaceApplyFlow({
    spaceId,
    spaceProfileUrl,
    communityName,
    parentSpaceId,
  });

  if (loading || isMember) {
    return null;
  }

  return (
    <div className={className}>
      <SpaceAboutApplyButton {...buttonProps} />
      {dialogs}
    </div>
  );
}
