import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Button, DialogContent } from '@mui/material';
import { type MouseEventHandler, type PropsWithChildren, type ReactNode, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Actions } from '@/core/ui/actions/Actions';
import ContributorCardHorizontal from '@/core/ui/card/ContributorCardHorizontal';
import PageContentBlockGrid from '@/core/ui/content/PageContentBlockGrid';
import PageContentBlockSeamless from '@/core/ui/content/PageContentBlockSeamless';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import { gutters } from '@/core/ui/grid/utils';
import type { Location } from '@/core/ui/location/getLocationString';
import { BlockSectionTitle, CardText } from '@/core/ui/typography';
import VCIcon from '@/domain/community/virtualContributor/VirtualContributorsIcons';
import References from '@/domain/shared/components/References/References';
import { isSocialNetworkSupported } from '@/domain/shared/components/SocialLinks/models/SocialNetworks';
import UserCard from '../../user/userCard/UserCard';
import type { ContributorProps } from '../InviteContributorsProps';

export type ProviderProfile =
  | {
      displayName: string;
      avatar?: {
        uri: string;
      };
      tagline?: string;
      location?: Location;
      tagsets?: { tags: string[] }[];
      url?: string;
    }
  | undefined;

interface PreviewContributorDialogProps {
  open?: boolean;
  onClose: () => void;
  contributor: ContributorProps | undefined;
  actions?: ReactNode;
  provider?: ProviderProfile;
  getProvider?: (vcId: string) => Promise<void> | void;
}

const PreviewContributorDialog = ({
  children,
  open = false,
  contributor,
  onClose,
  actions,
  provider,
  getProvider,
}: PropsWithChildren<PreviewContributorDialogProps>) => {
  const { t } = useTranslation();

  const { profile } = contributor ?? {};

  const references = profile?.references ?? [];

  const links = useMemo(() => {
    return references.filter(reference => !isSocialNetworkSupported(reference.name));
  }, [references]);

  const navigateToProfile: MouseEventHandler = useCallback(
    e => {
      if (profile?.url) {
        e?.preventDefault();
        // the navigation is handled here as with the router
        // it's throwing errors due to rerenders
        window.location.href = profile.url;
      }
    },
    [profile?.url]
  );

  useEffect(() => {
    if (open && contributor?.id) {
      getProvider?.(contributor.id);
    }
  }, [open, contributor?.id]);

  return (
    <DialogWithGrid open={open} columns={12} onClose={onClose} aria-labelledby="preview-contributor-dialog">
      <DialogHeader
        id="preview-contributor-dialog"
        icon={<VCIcon />}
        title={t('community.invitations.inviteContributorsDialog.vcs.title')}
        onClose={onClose}
      />

      <DialogContent>
        <PageContentBlockGrid disablePadding={true}>
          <PageContentColumn columns={3}>
            <UserCard
              displayName={profile?.displayName}
              avatarSrc={profile?.avatar?.uri ?? ''}
              avatarAltText={profile?.displayName}
              tags={profile?.tagsets?.flatMap(tagset => tagset.tags ?? []) ?? []}
              city={profile?.location?.city ?? ''}
              country={profile?.location?.country ?? ''}
              isContactable={false}
              url={profile?.url}
              onCardClick={navigateToProfile}
              isExpandable={false}
            />
            <PageContentBlockSeamless disablePadding={true}>
              <Actions justifyContent="end">
                <Button
                  startIcon={<ArrowBackIcon />}
                  variant="text"
                  onClick={() => onClose()}
                  sx={{ marginRight: gutters() }}
                >
                  {t('buttons.back')}
                </Button>
                {actions}
              </Actions>
            </PageContentBlockSeamless>
            {links && links.length > 0 && (
              <PageContentBlockSeamless disablePadding={true}>
                <BlockSectionTitle>{t('common.references')}</BlockSectionTitle>
                <References
                  references={links}
                  noItemsView={<CardText color="neutral.main">{t('common.no-references')}</CardText>}
                />
              </PageContentBlockSeamless>
            )}
            <PageContentBlockSeamless disablePadding={true}>
              <BlockSectionTitle>{t('pages.virtualContributorProfile.host')}</BlockSectionTitle>
              <ContributorCardHorizontal profile={provider} seamless={true} />
            </PageContentBlockSeamless>
          </PageContentColumn>
          <PageContentColumn columns={9} alignSelf="stretch" flexDirection="column">
            {children}
          </PageContentColumn>
        </PageContentBlockGrid>
      </DialogContent>
    </DialogWithGrid>
  );
};

export default PreviewContributorDialog;
