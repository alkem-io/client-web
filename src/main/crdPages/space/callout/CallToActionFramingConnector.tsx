import { CalloutLinkAction } from '@/crd/components/callout/CalloutLinkAction';
import type { CalloutDetailsModelExtended } from '@/domain/collaboration/callout/models/CalloutDetailsModel';
import { mapLinkToCallToActionProps } from '../dataMappers/callToActionDataMapper';

type CallToActionFramingConnectorProps = {
  callout: CalloutDetailsModelExtended;
};

/**
 * Renders the call-to-action button inside CalloutDetailDialog's framing slot.
 * Reads `callout.framing.link`, delegates URL parsing / external detection to
 * the mapper, and hands plain string props to the CRD component.
 */
export function CallToActionFramingConnector({ callout }: CallToActionFramingConnectorProps) {
  const props = mapLinkToCallToActionProps(callout.framing.link);
  if (!props) return null;
  return (
    <CalloutLinkAction
      url={props.url}
      displayName={props.displayName}
      isExternal={props.isExternal}
      isValid={props.isValid}
    />
  );
}
