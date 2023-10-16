import React, { PropsWithChildren } from 'react';
import TabDescriptionHeader from '../../../../shared/layout/TabDescriptionHeader/TabDescriptionHeader';
import { useTranslation } from 'react-i18next';
import { SectionSpacer } from '../../../../shared/components/Section/Section';
import { EntityTypeName } from '../../../constants/EntityTypeName';

/**
 * @deprecated
 * TODO clean up layout interfaces
 */
export interface SimplePageLayoutProps<Section extends string | number> {
  currentSection: Section;
  entityTypeName: EntityTypeName;
  tabDescriptionNs?: string;
}

/**
 * Base content structure for Admin pages
 */
const SettingsPageContent = <Section extends string | number>({
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

export default SettingsPageContent;
