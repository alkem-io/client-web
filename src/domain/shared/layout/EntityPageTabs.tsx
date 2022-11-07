import React, { FC, ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import HeaderNavigationTabs from '../components/PageHeader/HeaderNavigationTabs';
import HeaderNavigationTab from '../components/PageHeader/HeaderNavigationTab';
import { EntityPageSection } from './EntityPageSection';
import { EntityTypeName } from './PageLayout/SimplePageLayout';
import HeaderNavigationButton from '../components/PageHeader/HeaderNavigationButton';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import { ShareDialog } from '../components/ShareDialog';

export interface EntityPageTabsProps {
  currentTab: EntityPageSection;
  showSettings: boolean;
  settingsUrl: string;
  entityTypeName: EntityTypeName;
  subEntityTab?: ReactNode;
  rootUrl: string;
  shareUrl: string;
}

const EntityPageTabs: FC<EntityPageTabsProps> = ({
  currentTab,
  showSettings,
  settingsUrl,
  entityTypeName,
  subEntityTab,
  rootUrl,
  shareUrl,
}) => {
  const { t } = useTranslation();
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  return (
    <>
      <HeaderNavigationTabs
        value={currentTab}
        defaultTab={EntityPageSection.Dashboard}
        aria-label={`${entityTypeName} tabs`}
        showSettings={showSettings}
        settingsUrl={settingsUrl}
      >
        <HeaderNavigationTab
          label={t('common.dashboard')}
          value={EntityPageSection.Dashboard}
          to={`${rootUrl}/${EntityPageSection.Dashboard}`}
        />
        <HeaderNavigationTab
          label={t('common.explore')}
          value={EntityPageSection.Explore}
          to={`${rootUrl}/${EntityPageSection.Explore}`}
        />
        {subEntityTab}
        <HeaderNavigationTab
          label={t('common.about')}
          value={EntityPageSection.About}
          to={`${rootUrl}/${EntityPageSection.About}`}
        />
        {shareUrl && (
          <HeaderNavigationButton
            icon={<ShareOutlinedIcon />}
            value={'share'}
            onClick={() => setShareDialogOpen(true)}
          />
        )}
      </HeaderNavigationTabs>
      {shareUrl && (
        <ShareDialog
          open={shareDialogOpen}
          onClose={() => setShareDialogOpen(false)}
          url={shareUrl}
          entityTypeName={entityTypeName}
        />
      )}
    </>
  );
};

export default EntityPageTabs;
