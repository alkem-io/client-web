import DashboardGenericSection, {
  DashboardGenericSectionProps,
} from '../../../shared/components/DashboardSections/DashboardGenericSection';
import { Typography } from '@mui/material';
import React from 'react';
import { WhiteboardIcon } from '../icon/WhiteboardIcon';
import { useTranslation } from 'react-i18next';
import SimpleCard from '../../../shared/components/SimpleCard';
import { LinkWithState } from '../../../shared/types/LinkWithState';
import SimpleCardsList from '../../../shared/components/SimpleCardsList';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import { WhiteboardFragmentWithCallout } from '../../callout/useCallouts/useCallouts';

interface WhiteboardsDashboardPreviewProps extends DashboardGenericSectionProps {
  whiteboards: WhiteboardFragmentWithCallout[];
  whiteboardsCount: number | undefined;
  loading?: boolean;
  noItemsMessage?: string;
  buildWhiteboardLink: (whiteboardNameId: string, calloutNameId) => LinkWithState;
}

const WhiteboardsDashboardPreview = ({
  whiteboards,
  whiteboardsCount,
  loading,
  noItemsMessage,
  buildWhiteboardLink,
  ...sectionProps
}: WhiteboardsDashboardPreviewProps) => {
  const { t } = useTranslation();

  const headerText =
    typeof whiteboardsCount === 'undefined'
      ? t('common.whiteboards')
      : `${t('common.whiteboards')} (${whiteboardsCount})`;

  if (whiteboards.length === 0) {
    return null;
  }

  return (
    <DashboardGenericSection
      headerText={headerText}
      {...sectionProps}
      navText={t('buttons.see-all')}
      navLink={EntityPageSection.Contribute}
    >
      <SimpleCardsList>
        {whiteboards.map(whiteboard => (
          <SimpleCard
            key={whiteboard.id}
            {...buildWhiteboardLink(whiteboard.nameID, whiteboard.calloutNameId)}
            title={whiteboard.profile.displayName}
            imageUrl={whiteboard.profile.visual?.uri}
            iconComponent={WhiteboardIcon}
          />
        ))}
      </SimpleCardsList>
      {whiteboards.length === 0 && noItemsMessage && !loading && <Typography>{noItemsMessage}</Typography>}
    </DashboardGenericSection>
  );
};

export default WhiteboardsDashboardPreview;
