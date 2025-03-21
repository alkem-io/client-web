import React, { PropsWithChildren, Ref } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, DialogContent } from '@mui/material';
import {
  AuthorizationPrivilege,
  CalloutState,
  CalloutType,
  ContributeTabPostFragment,
  MessageDetailsFragment,
  WhiteboardDetailsFragment,
} from '@/core/apollo/generated/graphql-schema';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import { BlockTitle } from '@/core/ui/typography';
import Gutters from '@/core/ui/grid/Gutters';
import { Ribbon } from '@/core/ui/card/Ribbon';
import { Reference, Tagset } from '@/domain/common/profile/Profile';
import References from '@/domain/shared/components/References/References';
import TagsComponent from '@/domain/shared/components/TagsComponent/TagsComponent';
import { LinkDetails } from '../links/LinkCollectionCallout';
import CalloutHeader from './CalloutHeader';
import CalloutClosedMarginal from './CalloutClosedMarginal';

export interface CalloutLayoutProps {
  callout: {
    id: string;
    framing: {
      profile: {
        id: string;
        url: string;
        displayName: string;
        description?: string;
        references?: Reference[];
        tagset?: Tagset;
        storageBucket: {
          id: string;
        };
      };
      whiteboard?: WhiteboardDetailsFragment;
    };
    comments?: {
      messages: MessageDetailsFragment[] | undefined;
    };
    type: CalloutType;
    contributionPolicy: {
      state: CalloutState;
    };
    contributionDefaults: {
      postDescription?: string;
      whiteboardContent?: string;
    };
    contributions?: {
      id?: string;
      sortOrder?: number;
      link?: LinkDetails;
      post?: ContributeTabPostFragment;
      whiteboard?: WhiteboardDetailsFragment;
    }[];
    draft: boolean;
    editable?: boolean;
    movable?: boolean;
    canSaveAsTemplate?: boolean;
    authorization?: {
      myPrivileges?: AuthorizationPrivilege[];
    };
    authorName?: string;
    authorAvatarUri?: string;
    publishedAt?: string;
  };
  contributionsCount: number;
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

  if (dontShow) {
    return null;
  }

  const hasCalloutDetails = callout.authorName && callout.publishedAt;

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
