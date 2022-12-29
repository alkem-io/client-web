import React, { PropsWithChildren } from 'react';
import TabDescriptionHeader from '../TabDescriptionHeader/TabDescriptionHeader';
import { useTranslation } from 'react-i18next';
import { SectionSpacer } from '../../components/Section/Section';

/**
 * The purpose of this component is to contain all UI elements that are common to a page,
 * such as breadcrumbs, tabs, the tab explanation header and the page content wrapper.
 * One incomplete example is src/domain/admin/layout/EntitySettings/EntitySettingsLayout.tsx.
 * Ideally, the whole screen content including the topmost parts such as UserSegment should
 * migrate to the layout and thus be controlled from within a page. Then, EntitySettingsLayout
 * as well as any derived layout should be a usage of this one, parameterized through composition.
 */

export type EntityTypeName = 'hub' | 'challenge' | 'opportunity' | 'organization' | 'user';

export interface SimplePageLayoutProps<Section extends string | number> {
  currentSection: Section;
  entityTypeName: EntityTypeName;
  tabDescriptionNs?: string;
}

/**
 * @deprecated - Tab description text is no longer part of the new design
 * TODO figure out what to do with this one.
 */
const SimplePageLayout = <Section extends string | number>({
  currentSection,
  entityTypeName,
  tabDescriptionNs = 'pages',
  children,
}: PropsWithChildren<SimplePageLayoutProps<Section>>) => {
  const { t } = useTranslation();

  type TLabel = Parameters<typeof t>[0];

  const tabDescriptionText = t(
    [
      `${tabDescriptionNs}.${entityTypeName}.sections.${currentSection}.description`,
      `${tabDescriptionNs}.generic.sections.${currentSection}.description`,
    ] as TLabel,
    {
      entity: t(`common.${entityTypeName}` as const).toLowerCase(),
    }
  );

  return (
    <>
      <TabDescriptionHeader>{tabDescriptionText}</TabDescriptionHeader>
      <SectionSpacer />
      {children}
    </>
  );
};

export default SimplePageLayout;
