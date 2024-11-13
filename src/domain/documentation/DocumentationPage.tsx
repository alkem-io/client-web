import TopLevelLayout from '@main/ui/layout/TopLevelLayout';
import TopLevelPageBreadcrumbs from '@main/topLevelPages/topLevelPageBreadcrumbs/TopLevelPageBreadcrumbs';
import PageContent from '@core/ui/content/PageContent';
import PageContentBlock from '@core/ui/content/PageContentBlock';
import SpacePageBanner from '../journey/space/layout/SpacePageBanner';
import { useLocation } from 'react-router-dom';
import Gutters from '@core/ui/grid/Gutters';
import { useConfig } from '../platform/config/useConfig';
import { TopLevelRoutePath } from '@main/routing/TopLevelRoutePath';
import { useTranslation } from 'react-i18next';

const DocumentationPage = () => {
  const { t } = useTranslation();
  const { locations } = useConfig();
  const { pathname } = useLocation();
  const docsInternalPath = pathname.split(`/${TopLevelRoutePath.Docs}/`)[1] ?? '';

  let src = `${locations?.documentation}/${docsInternalPath}`;

  return (
    <TopLevelLayout
      header={<SpacePageBanner title={t('pages.documentation.title')} journeyTypeName="admin" />}
      breadcrumbs={<TopLevelPageBreadcrumbs />}
    >
      <PageContent>
        <PageContentBlock fullHeight>
          <Gutters height={'100vh'}>
            <iframe
              src={src}
              title={t('pages.documentation.title')}
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          </Gutters>
        </PageContentBlock>
      </PageContent>
    </TopLevelLayout>
  );
};

export default DocumentationPage;
