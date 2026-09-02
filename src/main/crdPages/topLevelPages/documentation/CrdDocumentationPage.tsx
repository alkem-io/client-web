import { useTranslation } from 'react-i18next';
import { usePageTitle } from '@/core/routing/usePageTitle';
import { Loading } from '@/crd/components/common/Loading';
import { DocumentationFrame } from '@/crd/components/documentation/DocumentationFrame';
import { useDocumentationFrame } from '@/main/crdPages/topLevelPages/documentation/useDocumentationFrame';

const CrdDocumentationPage = () => {
  const { t: tDoc } = useTranslation('crd-documentation');
  const { t } = useTranslation();

  usePageTitle(t('pages.titles.documentation'));

  const { src, iframeRef, initialHeight } = useDocumentationFrame();

  if (!src) {
    return <Loading text={tDoc('loading')} />;
  }

  return (
    <DocumentationFrame src={src} title={tDoc('frameLabel')} iframeRef={iframeRef} initialHeight={initialHeight} />
  );
};

export default CrdDocumentationPage;
