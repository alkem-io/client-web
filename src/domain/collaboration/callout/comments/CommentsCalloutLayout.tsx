import React, { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';
import { AuthorizationPrivilege } from '../../../../core/apollo/generated/graphql-schema';
import WrapperMarkdown from '../../../../core/ui/markdown/WrapperMarkdown';
import { BlockTitle } from '../../../../core/ui/typography';
import { Ribbon } from '../../../../core/ui/card/Ribbon';
import References from '../../../shared/components/References/References';
import TagsComponent from '../../../shared/components/TagsComponent/TagsComponent';
import CalloutHeader from '../calloutBlock/CalloutHeader';
import CalloutClosedMarginal from '../calloutBlock/CalloutClosedMarginal';
import { CalloutLayoutProps } from '../calloutBlock/CalloutLayout';
import { gutters } from '../../../../core/ui/grid/utils';

const CommentsCalloutLayout = ({
  callout,
  children,
  contributionsCount,
  isMember,
  expanded = false,
  onExpand,
  onCollapse,
  skipReferences,
  disableMarginal = false,
  settingsOpen,
  onOpenSettings,
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
      />
      {hasCalloutDetails && <BlockTitle noWrap>{callout.framing.profile.displayName}</BlockTitle>}
      <Box sx={{ wordWrap: 'break-word' }} paddingX={gutters()}>
        <WrapperMarkdown caption>{callout.framing.profile.description ?? ''}</WrapperMarkdown>
      </Box>
      {!skipReferences && !!callout.framing.profile.references?.length && (
        <Box padding={gutters()} paddingTop={gutters(0.5)}>
          <References compact references={callout.framing.profile.references} />
        </Box>
      )}
      {callout.framing.profile.tagset?.tags && callout.framing.profile.tagset?.tags.length > 0 ? (
        <TagsComponent tags={callout.framing.profile.tagset?.tags} sx={{ paddingX: gutters() }} />
      ) : undefined}
      {children}
      <CalloutClosedMarginal
        callout={callout}
        disabled={disableMarginal}
        contributionsCount={contributionsCount}
        isMember={isMember}
      />
    </>
  );
};

export default CommentsCalloutLayout;
