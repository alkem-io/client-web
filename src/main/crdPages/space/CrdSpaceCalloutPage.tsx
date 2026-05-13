import { useNavigate } from 'react-router-dom';
import { toRoutePath } from '@/crd/lib/toRoutePath';
import { useSpace } from '@/domain/space/context/useSpace';
import { CrdCalloutDialogFromUrl } from './callout/CrdCalloutDialogFromUrl';
import CrdSpaceTabbedPages from './tabs/CrdSpaceTabbedPages';

/**
 * Route element for `…/collaboration/:calloutNameId/*` at the space (L0)
 * level. Renders the regular space tabbed pages behind the CRD callout
 * detail dialog so closing the dialog leaves the user on a populated space
 * page (matches the MUI `SpaceCalloutPage` flow). Used by `CrdSpaceRoutes`.
 */
export default function CrdSpaceCalloutPage() {
  const navigate = useNavigate();
  const { space } = useSpace();

  return (
    <>
      <CrdSpaceTabbedPages />
      <CrdCalloutDialogFromUrl
        onClose={() => navigate(toRoutePath(space.about.profile.url), { replace: true, state: { keepScroll: true } })}
      />
    </>
  );
}
