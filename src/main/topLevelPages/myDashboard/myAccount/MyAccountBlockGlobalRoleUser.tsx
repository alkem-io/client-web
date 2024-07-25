import { useTranslation } from 'react-i18next';
import { Button, ListItemButton, ListItemButtonProps, ListItemButtonTypeMap } from '@mui/material';
import { gutters } from '../../../../core/ui/grid/utils';
import { BlockSectionTitle, Caption } from '../../../../core/ui/typography';
import BadgeCardView from '../../../../core/ui/list/BadgeCardView';
import Avatar from '../../../../core/ui/avatar/Avatar';
import defaultJourneyAvatar from '../../../../domain/journey/defaultVisuals/Avatar.jpg';
import RouterLink, { RouterLinkProps } from '../../../../core/ui/link/RouterLink';
import Gutters from '../../../../core/ui/grid/Gutters';
import { Actions } from '../../../../core/ui/actions/Actions';
import SeeMore from '../../../../core/ui/content/SeeMore';
import VirtualContributorsDialog from '../../../../domain/community/community/VirtualContributorsBlock/VirtualContributorsDialog';
import { useState } from 'react';
import { MyAccountSpace, MyAccountVirtualContributor } from './MyAccountBlock';

interface MyAccountBlockGlobalRoleUserProps {
  hostedSpace: MyAccountSpace | undefined;
  virtualContributors: MyAccountVirtualContributor[];
  startWizard: () => void;
  createLink: string;
}

const VIRTUAL_CONTRIBUTORS_LIMIT = 3;

const MyAccountBlockGlobalRoleUser = ({
  hostedSpace,
  virtualContributors,
  startWizard,
  createLink,
}: MyAccountBlockGlobalRoleUserProps) => {
  const { t } = useTranslation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const openDialog = () => setDialogOpen(true);
  const closeDialog = () => setDialogOpen(false);

  const visibleVCs =
    virtualContributors?.length > VIRTUAL_CONTRIBUTORS_LIMIT
      ? virtualContributors.slice(0, VIRTUAL_CONTRIBUTORS_LIMIT)
      : virtualContributors;
  const hasVirtualCointributors = Boolean(virtualContributors && virtualContributors.length > 0);

  const Wrapper = <D extends React.ElementType = ListItemButtonTypeMap['defaultComponent'], P = {}>(
    props: ListItemButtonProps<D, P> & RouterLinkProps
  ) => <ListItemButton component={RouterLink} {...props} />;

  return (
    <>
      <Gutters disablePadding disableGap>
        <Caption marginBottom={gutters(0.5)}>{t('pages.home.sections.myAccount.hostedSpaces')}</Caption>
        {hostedSpace ? (
          <BadgeCardView
            variant="rounded"
            visual={
              <Avatar
                src={hostedSpace.profile.cardBanner?.uri || defaultJourneyAvatar}
                alt={t('common.avatar-of', { user: hostedSpace.profile.displayName })}
              />
            }
            component={Wrapper}
            to={hostedSpace.profile.url}
          >
            <BlockSectionTitle>{hostedSpace.profile.displayName}</BlockSectionTitle>
            <BlockSectionTitle>{hostedSpace.profile.tagline}</BlockSectionTitle>
          </BadgeCardView>
        ) : (
          <Actions paddingY={gutters(0.5)}>
            <Button
              aria-label={t('pages.home.sections.myAccount.globalRoleUser.createSpaceButton')}
              variant="contained"
              component={RouterLink}
              to={createLink}
              sx={{ padding: gutters(0.5), textTransform: 'none', flex: 1 }}
            >
              {t('pages.home.sections.myAccount.globalRoleUser.createSpaceButton')}
            </Button>
          </Actions>
        )}
      </Gutters>
      <Gutters disablePadding disableGap>
        <Caption marginBottom={gutters(0.5)}>{t('pages.home.sections.myAccount.virtualContributors')}</Caption>
        {hasVirtualCointributors ? (
          <>
            {visibleVCs?.map(vc => (
              <BadgeCardView
                key={vc.id}
                variant="rounded"
                visual={
                  <Avatar src={vc.profile.avatar?.uri} alt={t('common.avatar-of', { user: vc.profile.displayName })} />
                }
                component={Wrapper}
                to={vc.profile.url}
              >
                <BlockSectionTitle>{vc.profile.displayName}</BlockSectionTitle>
              </BadgeCardView>
            ))}
            {virtualContributors?.length > VIRTUAL_CONTRIBUTORS_LIMIT && (
              <SeeMore label="buttons.see-more" onClick={openDialog} />
            )}
            <VirtualContributorsDialog
              open={dialogOpen}
              onClose={closeDialog}
              virtualContributors={virtualContributors}
            />
            <Actions paddingY={gutters(0.5)}>
              <Button
                aria-label={t('pages.home.sections.myAccount.globalRoleUser.createAnotherVCButton')}
                variant={'outlined'}
                sx={{ textTransform: 'none', paddingTop: gutters(0.5), paddingBottom: gutters(0.5), flex: 1 }}
                onClick={startWizard}
              >
                {t('pages.home.sections.myAccount.globalRoleUser.createAnotherVCButton')}
              </Button>
            </Actions>
          </>
        ) : (
          <Actions paddingY={gutters(0.5)}>
            <Button
              aria-label={t('pages.home.sections.myAccount.createVCButton')}
              variant={hostedSpace ? 'contained' : 'outlined'}
              sx={{ textTransform: 'none', paddingTop: gutters(0.5), paddingBottom: gutters(0.5), flex: 1 }}
              onClick={startWizard}
            >
              {hostedSpace
                ? t('pages.home.sections.myAccount.createYourVCButton')
                : t('pages.home.sections.myAccount.createVCButton')}
            </Button>
          </Actions>
        )}
      </Gutters>
    </>
  );
};

export default MyAccountBlockGlobalRoleUser;
