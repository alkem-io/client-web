import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import useCanReadSpace from '@/domain/journey/space/graphql/queries/useCanReadSpace';
import useNavigate from '@/core/routing/useNavigate';
import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';

/**
 * Custom hook to handle redirection to the "about" page if the user does not have read access to the space.
 *
 * @param {Object} params - The parameters for the hook.
 * @param {string} params.spaceId - The ID of the space.
 * @param {string} params.currentSection - The EntityPageSection of the space.
 * @param {boolean} params.skip - Whether to skip the redirection logic.
 */
const useAboutRedirect = ({
  spaceId,
  currentSection,
  skip,
}: {
  spaceId: string | undefined;
  currentSection?: EntityPageSection | undefined;
  skip?: boolean;
}) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const spaceReadAccess = useCanReadSpace({ spaceId });

  // known issue where the path is updated but the spaceId is still the old one (from the URLProvider)
  // this leads to loading of About page for space with canReadSpace if the previous one was not accessible
  useEffect(() => {
    const hasAboutInPath = pathname.includes(`/${EntityPageSection.About}`);

    if (skip || hasAboutInPath || spaceReadAccess.loading) {
      return;
    }

    const path = pathname.split(`/${currentSection}`)[0]; // remove the currentSection to properly redirect to the about page

    if (!spaceReadAccess.canReadSpace) {
      navigate(`${path}/${EntityPageSection.About}`);
    }
  }, [skip, spaceReadAccess, pathname, currentSection, navigate, spaceReadAccess]);
};

export default useAboutRedirect;
