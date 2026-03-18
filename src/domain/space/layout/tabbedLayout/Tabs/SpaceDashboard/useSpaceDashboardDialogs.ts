import { useEffect, useState } from 'react';
import { getSpaceWelcomeCache, removeSpaceWelcomeCache } from '@/domain/space/components/CreateSpace/utils';
import {
  getVCCreationCache,
  removeVCCreationCache,
} from '@/main/topLevelPages/myDashboard/newVirtualContributorWizard/TryVC/utils';

export const useSpaceDashboardDialogs = (spaceId: string | undefined) => {
  const [aboutDialogOpen, setAboutDialogOpen] = useState(false);
  const [tryVirtualContributorOpen, setTryVirtualContributorOpen] = useState(false);
  const [openWelcome, setOpenWelcome] = useState(false);
  const [vcId, setVcId] = useState('');

  const onCloseTryVirtualContributor = () => {
    setTryVirtualContributorOpen(false);
    removeVCCreationCache();
  };

  const onCloseWelcome = () => {
    setOpenWelcome(false);
    removeSpaceWelcomeCache();
  };

  useEffect(() => {
    const cachedVCId = getVCCreationCache();
    if (cachedVCId) {
      setVcId(cachedVCId);
      setTryVirtualContributorOpen(true);
    }
    return () => {
      setAboutDialogOpen(false);
      onCloseTryVirtualContributor();
    };
  }, []);

  useEffect(() => {
    const cachedSpaceWelcome = getSpaceWelcomeCache();
    if (spaceId && cachedSpaceWelcome === spaceId) {
      setOpenWelcome(true);
    }
  }, [spaceId]);

  return {
    aboutDialogOpen,
    setAboutDialogOpen,
    tryVirtualContributorOpen,
    onCloseTryVirtualContributor,
    openWelcome,
    onCloseWelcome,
    vcId,
  };
};
