import React, { PropsWithChildren, Ref } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, DialogContent } from '@mui/material';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import { BlockTitle } from '@/core/ui/typography';
import Gutters from '@/core/ui/grid/Gutters';
import { Ribbon } from '@/core/ui/card/Ribbon';
import References from '@/domain/shared/components/References/References';
import TagsComponent from '@/domain/shared/components/TagsComponent/TagsComponent';
import CalloutHeader from './CalloutHeader';
import CalloutClosedMarginal from './CalloutClosedMarginal';
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

const CalloutLayout = ({
  callout,
  children,
  contributionsCount,
  expanded = false,
  onExpand,
  onCollapse,
  skipReferences,
  disableMarginal = false,
  contentRef,
  settingsOpen,
  onOpenSettings,
  calloutActions = true,
}: PropsWithChildren<CalloutLayoutProps>) => {
  const { t } = useTranslation();

  const dontShow = callout.draft && !callout?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update);

  // Prevents double title
  // TODO: check if this is still needed
  const hasCalloutDetails = callout.authorName && callout.publishedAt;

  if (dontShow) {
    return null;
  }

  return (
    <>
      {callout.draft && (
        <Ribbon>
          <BlockTitle textAlign="center">{t('callout.draftNotice')}</BlockTitle>
        </Ribbon>
      )}
      <CalloutHeader
        callout={callout}
        contributionsCount={contributionsCount}
        expanded={expanded}
        onExpand={onExpand}
        onCollapse={onCollapse}
        settingsOpen={settingsOpen}
        onOpenSettings={onOpenSettings}
        calloutActions={calloutActions}
      />
      <DialogContent ref={contentRef} sx={{ paddingTop: 0 }}>
        <Gutters disablePadding>
          {hasCalloutDetails && <BlockTitle noWrap>{callout.framing.profile.displayName}</BlockTitle>}
          <Box sx={{ wordWrap: 'break-word' }}>
            <WrapperMarkdown>{callout.framing.profile.description ?? ''}</WrapperMarkdown>
          </Box>
          {!skipReferences && <References compact references={callout.framing.profile.references} />}
          {callout.framing.profile.tagset?.tags && callout.framing.profile.tagset?.tags.length > 0 ? (
            <TagsComponent tags={callout.framing.profile.tagset?.tags} />
          ) : undefined}
          {children}
        </Gutters>
      </DialogContent>
      <CalloutClosedMarginal callout={callout} disabled={disableMarginal} />
    </>
  );
};

export default CalloutLayout;
