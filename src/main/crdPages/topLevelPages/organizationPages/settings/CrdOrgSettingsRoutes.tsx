import { useTranslation } from 'react-i18next';
import { Navigate, Route, Routes } from 'react-router-dom';
import { PlaceholderTab } from './_placeholder/PlaceholderTab';
import CrdOrgSettingsPage from './CrdOrgSettingsPage';

type OrgPlaceholderKey =
  | 'shell.tabs.org.profile'
  | 'shell.tabs.org.account'
  | 'shell.tabs.org.community'
  | 'shell.tabs.org.authorization'
  | 'shell.tabs.org.settings';

const PlaceholderRoute = ({ labelKey }: { labelKey: OrgPlaceholderKey }) => {
  const { t } = useTranslation('crd-contributorSettings');
  return <PlaceholderTab tabLabelKey={t(labelKey)} />;
};

/**
 * Routes the Org settings sub-tree (`/organization/<orgSlug>/settings/*`).
 *
 * MVP-first: every tab body is a placeholder until per-story phases land
 * (US8–US12). The shell + tab strip are fully wired so all 5 settings URLs
 * resolve correctly with the right active highlight.
 */
export const CrdOrgSettingsRoutes = () => (
  <Routes>
    <Route path="" element={<CrdOrgSettingsPage />}>
      <Route index={true} element={<Navigate to="profile" replace={true} />} />
      <Route path="profile" element={<PlaceholderRoute labelKey="shell.tabs.org.profile" />} />
      <Route path="account" element={<PlaceholderRoute labelKey="shell.tabs.org.account" />} />
      <Route path="community" element={<PlaceholderRoute labelKey="shell.tabs.org.community" />} />
      <Route path="authorization" element={<PlaceholderRoute labelKey="shell.tabs.org.authorization" />} />
      <Route path="settings" element={<PlaceholderRoute labelKey="shell.tabs.org.settings" />} />
      <Route path="*" element={<Navigate to="profile" replace={true} />} />
    </Route>
  </Routes>
);

export default CrdOrgSettingsRoutes;
