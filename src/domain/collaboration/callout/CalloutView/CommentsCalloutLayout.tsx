import { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import WrapperMarkdown, { MARKDOWN_CLASS_NAME } from '@/core/ui/markdown/WrapperMarkdown';
import { BlockTitle } from '@/core/ui/typography';
import { Ribbon } from '@/core/ui/card/Ribbon';
import References from '@/domain/shared/components/References/References';
import TagsComponent from '@/domain/shared/components/TagsComponent/TagsComponent';
import CalloutHeader from '../calloutBlock/CalloutHeader';
import CalloutClosedMarginal from '../calloutBlock/CalloutClosedMarginal';
import { CalloutLayoutProps } from '../calloutBlock/CalloutLayoutTypes';
import { gutters } from '@/core/ui/grid/utils';

const DESCRIPTION_MAX_HEIGHT = 'calc(100vh - 400px)';

const CommentsCalloutLayout = ({
  callout,
  children,
  contributionsCount,
  isMember,
  expanded = false,
  onExpand,
  onCollapse,
  skipReferences,
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

  // fixes comments not visible when description too long in modal/expanded
  const expandedStyles = expanded ? { maxHeight: DESCRIPTION_MAX_HEIGHT, overflowY: 'auto' } : undefined;

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
      {hasCalloutDetails && <BlockTitle noWrap>{callout.framing.profile.displayName}</BlockTitle>}
      <Box className={MARKDOWN_CLASS_NAME}>
        <WrapperMarkdown caption sx={expandedStyles}>
          {callout.framing.profile.description ?? ''}
        </WrapperMarkdown>
      </Box>
      {!skipReferences && !!callout.framing.profile.references?.length && (
        <Box paddingX={gutters()} paddingBottom={gutters(0.5)}>
          <References compact references={callout.framing.profile.references} />
        </Box>
      )}
      {callout.framing.profile.tagset?.tags && callout.framing.profile.tagset?.tags.length > 0 ? (
        <TagsComponent tags={callout.framing.profile.tagset?.tags} sx={{ paddingX: gutters() }} />
      ) : undefined}
      {expanded ? <Box sx={{ overflowY: 'auto' }}>{children}</Box> : children}
      <CalloutClosedMarginal
        messagesCount={callout.comments?.messages?.length ?? 0}
        disabled={!callout.settings.framing.commentsEnabled}
        contributionsCount={contributionsCount}
        isMember={isMember}
      />
    </>
  );
};

export default CommentsCalloutLayout;
