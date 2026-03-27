import { useTranslation } from 'react-i18next';
import { usePageTitle } from '@/core/routing/usePageTitle';
import { SpaceExplorerCrdView } from './SpaceExplorerPage';
import useSpaceExplorer from './useSpaceExplorer';

const SpaceExplorerPage = () => {
  const { t } = useTranslation();

  usePageTitle(t('pages.titles.spaces'));

  const provided = useSpaceExplorer();

  return <SpaceExplorerCrdView {...provided} />;
};

export default SpaceExplorerPage;
