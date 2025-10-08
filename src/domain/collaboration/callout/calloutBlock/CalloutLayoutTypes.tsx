import React, { Ref } from 'react';
import { CalloutDetailsModelExtended } from '../models/CalloutDetailsModel';

export interface CalloutLayoutProps {
  callout: CalloutDetailsModelExtended;
  contributionsCount: number | undefined;
  isMember?: boolean;
  expanded: boolean | undefined;
  onExpand: ((callout: CalloutDetailsModelExtended) => void) | undefined;
  onCollapse: (() => void) | undefined;
  skipReferences?: boolean;
  contentRef?: Ref<Element>;
  settingsOpen?: boolean;
  onOpenSettings?: (event: React.MouseEvent<HTMLElement>) => void;
  calloutActions?: boolean;
}
