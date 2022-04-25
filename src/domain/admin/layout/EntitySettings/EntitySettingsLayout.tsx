import React, { FC, useCallback } from 'react';
import { SettingsSection } from './constants';
import PageTabs, { TabDefinition } from '../../../../components/core/PageTabs/PageTabs';
import AdminLayoutEntityTitle from '../AdminLayoutEntityTitle';
import { useTranslation } from 'react-i18next';
import { EntityLinkComponentProps } from '../../../../components/Admin/EntityLinkComponent';
import TabExplanationHeader from '../../../shared/layout/TabExplanationHeader/TabExplanationHeader';
import { SectionSpacer } from '../../../../components/core/Section/Section';

type EntityTypeName = 'hub' | 'challenge' | 'opportunity' | 'organization';

type EntitySettingsLayoutProps = EntityLinkComponentProps & {
  entityTypeName: EntityTypeName;
  tabs: TabDefinition<SettingsSection>[];
  currentTab: SettingsSection;
  tabRoutePrefix?: string;
};

const EntitySettingsLayout: FC<EntitySettingsLayoutProps> = ({
  entityTypeName,
  tabs,
  currentTab,
  tabRoutePrefix = '../',
  children,
  ...entityTitleProps
}) => {
  const { t } = useTranslation();

  const getTabLabel = useCallback((section: SettingsSection) => t(`common.${section}` as const), [t]);

  type TLabel = Parameters<typeof t>[0];

  const tabExplanationHeader = t(
    [
      `admin.tab-explanation-header.${entityTypeName}.${currentTab}`,
      `admin.tab-explanation-header.${currentTab}`,
      'admin.tab-explanation-header.generic',
    ] as TLabel,
    {
      section: t(`common.${currentTab}` as const),
      entity: t(`common.${entityTypeName}` as const),
    }
  );

  return (
    <>
      <AdminLayoutEntityTitle {...entityTitleProps} />
      <PageTabs
        tabs={tabs}
        currentTab={currentTab}
        aria-label={`${entityTypeName} Settings tabs`}
        routePrefix={tabRoutePrefix}
        getTabLabel={getTabLabel}
      />
      <TabExplanationHeader>{tabExplanationHeader}</TabExplanationHeader>
      <SectionSpacer />
      {children}
    </>
  );
};

export default EntitySettingsLayout;
