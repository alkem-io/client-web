import PageContentBlockSeamless from '@/core/ui/content/PageContentBlockSeamless';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import { EntityTypeName } from '@/domain/platform/constants/EntityTypeName';
import TabDescriptionHeader from '@/domain/shared/layout/TabDescriptionHeader/TabDescriptionHeader';
import { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';

interface SettingsPageContentProps<Section extends string | number> {
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
}: PropsWithChildren<SettingsPageContentProps<Section>>) => {
  const { t } = useTranslation();

  type TLabel = Parameters<typeof t>[0];

  const tabDescriptionKeys = [
    `${tabDescriptionNs}.${entityTypeName}.sections.${currentSection}.description`,
    `${tabDescriptionNs}.generic.sections.${currentSection}.description`,
  ] as unknown as TLabel;

  const tabDescriptionText = t(tabDescriptionKeys, {
    entity: t(`common.${entityTypeName}` as const).toLowerCase(),
  });

  return (
    <>
      <PageContentColumn columns={12}>
        {tabDescriptionText && (
          <PageContentBlockSeamless row justifyContent="center">
            <TabDescriptionHeader>
              <>{tabDescriptionText}</>
            </TabDescriptionHeader>
          </PageContentBlockSeamless>
        )}
        <PageContentBlockSeamless disablePadding>{children}</PageContentBlockSeamless>
      </PageContentColumn>
    </>
  );
};

export default SettingsPageContent;
