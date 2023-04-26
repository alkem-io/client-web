import CalloutLayout, { CalloutLayoutProps } from '../../CalloutBlock/CalloutLayout';
import React, { forwardRef } from 'react';
import { ReferencesFragmentWithCallout } from '../useCallouts/useCallouts';
import { BaseCalloutViewProps } from '../CalloutViewTypes';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';

type NeededFields = 'id' | 'calloutNameId';
export type LinkCollectionCalloutData = Pick<ReferencesFragmentWithCallout, NeededFields>;

interface LinkCollectionCalloutProps extends BaseCalloutViewProps {
  callout: CalloutLayoutProps['callout'];
  calloutNames: string[];
}

const LinkCollectionCallout = forwardRef<HTMLDivElement, LinkCollectionCalloutProps>(
  ({ callout, loading, expanded, contributionsCount, onExpand, blockProps, ...calloutLayoutProps }, ref) => {
    //  const { user: userMetadata, isAuthenticated } = useUserContext();
    //  const user = userMetadata?.user;

    return (
      <PageContentBlock ref={ref} disablePadding disableGap {...blockProps}>
        <CalloutLayout
          callout={callout}
          contributionsCount={contributionsCount}
          {...calloutLayoutProps}
          expanded={expanded}
          onExpand={onExpand}
        >
          <p>Links callout</p>
          {callout.profile.references?.map(r => (
            <li key={r.id}>{r.uri}</li>
          ))}
        </CalloutLayout>
      </PageContentBlock>
    );
  }
);

export default LinkCollectionCallout;
