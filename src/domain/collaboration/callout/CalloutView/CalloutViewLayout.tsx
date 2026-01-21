import { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { BlockTitle } from '@/core/ui/typography';
import { Ribbon } from '@/core/ui/card/Ribbon';
import References from '@/domain/shared/components/References/References';
import TagsComponent from '@/domain/shared/components/TagsComponent/TagsComponent';
import CalloutHeader from '../calloutBlock/CalloutHeader';
import { CalloutLayoutProps } from '../calloutBlock/CalloutLayoutTypes';
import { gutters } from '@/core/ui/grid/utils';
import ExpandableMarkdown from '@/core/ui/markdown/ExpandableMarkdown';

const CalloutViewLayout = ({
  callout,
  children,
  expanded = false,
  contentRef,
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

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: expanded ? '100%' : 'auto',
        position: 'relative',
        overflow: expanded ? 'hidden' : 'visible',
      }}
    >
      {/* header area - fixed at top */}
      <Box sx={{ position: expanded ? 'sticky' : 'static', top: 0, zIndex: 10, background: 'white' }}>
        {callout.draft && (
          <Ribbon>
            <BlockTitle textAlign="center">{t('callout.draftNotice')}</BlockTitle>
          </Ribbon>
        )}
        <CalloutHeader
          callout={callout}
          expanded={expanded}
          onExpand={onExpand}
          onCollapse={onCollapse}
          settingsOpen={settingsOpen}
          onOpenSettings={onOpenSettings}
          calloutActions={calloutActions}
        />
      </Box>

      {/* scrollable content region */}
      <Box
        ref={contentRef}
        sx={{
          flex: expanded ? '1 1 auto' : '0 0 auto',
          minHeight: 0,
          maxHeight: expanded ? 'calc(100% - 120px)' : 'none',
          overflowY: expanded ? 'auto' : 'visible',
        }}
      >
        <Box sx={theme => ({ padding: theme.spacing(0, 2, 1) })}>
          <ExpandableMarkdown caption>{callout.framing.profile.description ?? ''}</ExpandableMarkdown>
        </Box>
        {!skipReferences && !!callout.framing.profile.references?.length && (
          <Box paddingX={gutters()} paddingBottom={gutters(0.5)}>
            <References compact references={callout.framing.profile.references} />
          </Box>
        )}
        {callout.framing.profile.tagset?.tags && callout.framing.profile.tagset?.tags.length > 0 && (
          <TagsComponent tags={callout.framing.profile.tagset?.tags} sx={{ paddingX: gutters() }} />
        )}
        {children}
      </Box>
    </Box>
  );
};

export default CalloutViewLayout;
