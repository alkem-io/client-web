import React, { Ref } from 'react';
import { TypedCalloutDetails } from '../models/TypedCallout';

export interface CalloutLayoutProps {
  callout: TypedCalloutDetails;
  contributionsCount: number | undefined;
  isMember?: boolean;
  expanded: boolean | undefined;
  onExpand: (() => void) | undefined;
  onCollapse: (() => void) | undefined;
  skipReferences?: boolean;
  disableMarginal?: boolean;
  contentRef?: Ref<Element>;
  settingsOpen?: boolean;
  onOpenSettings?: (event: React.MouseEvent<HTMLElement>) => void;
  calloutActions?: boolean;
}
