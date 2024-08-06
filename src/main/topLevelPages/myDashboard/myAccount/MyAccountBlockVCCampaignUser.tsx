import { useTranslation } from 'react-i18next';
import { Button, ListItemButton, ListItemButtonProps, ListItemButtonTypeMap } from '@mui/material';
import Gutters from '../../../../core/ui/grid/Gutters';
import { BlockSectionTitle, Caption } from '../../../../core/ui/typography';
import { gutters } from '../../../../core/ui/grid/utils';
import { Actions } from '../../../../core/ui/actions/Actions';
import defaultJourneyAvatar from '../../../../domain/journey/defaultVisuals/Avatar.jpg';
import BadgeCardView from '../../../../core/ui/list/BadgeCardView';
import Avatar from '../../../../core/ui/avatar/Avatar';
import RouterLink, { RouterLinkProps } from '../../../../core/ui/link/RouterLink';
import { MyAccountSpace, MyAccountVirtualContributor } from './MyAccountBlock';

const VIRTUAL_CONTRIBUTORS_LIMIT = 3;

interface MyAccountBlockVCCampaignUserProps {
  hostedSpace: MyAccountSpace | undefined;
  virtualContributors: MyAccountVirtualContributor[];
  startWizard: () => void;
}

const MyAccountBlockVCCampaignUser = ({
  hostedSpace,
  virtualContributors,
  startWizard,
}: MyAccountBlockVCCampaignUserProps) => {
  const { t } = useTranslation();
  const hasVirtualCointributors = Boolean(virtualContributors && virtualContributors.length > 0);

  const Wrapper = <D extends React.ElementType = ListItemButtonTypeMap['defaultComponent'], P = {}>(
    props: ListItemButtonProps<D, P> & RouterLinkProps
  ) => <ListItemButton component={RouterLink} {...props} />;

  return (
    <>
      <Gutters disablePadding disableGap>
        {hostedSpace ? (
          <Gutters disablePadding disableGap>
            <Caption marginBottom={gutters(0.5)}>{t('pages.home.sections.myAccount.hostedSpaces')}</Caption>
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
          </Gutters>
        ) : (
          <>
            <Caption>{t('pages.home.sections.myAccount.vcCampaignUser.welcome')}</Caption>
            <Caption paddingTop={gutters(0.5)}>{t('pages.home.sections.myAccount.vcCampaignUser.clickHere')}</Caption>
          </>
        )}
      </Gutters>
      <Gutters disablePadding disableGap>
        {hostedSpace && (
          <Caption marginBottom={gutters(0.5)}>{t('pages.home.sections.myAccount.virtualContributors')}</Caption>
        )}
        {hasVirtualCointributors ? (
          <>
            {virtualContributors?.map(vc => (
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
            {virtualContributors?.length < VIRTUAL_CONTRIBUTORS_LIMIT ? (
              <Actions paddingY={gutters(0.5)}>
                <Button
                  aria-label={t('pages.home.sections.myAccount.createVCButton')}
                  variant={'outlined'}
                  sx={{ textTransform: 'none', paddingTop: gutters(0.5), paddingBottom: gutters(0.5), flex: 1 }}
                  onClick={startWizard}
                >
                  {t('pages.home.sections.myAccount.globalRoleUser.createAnotherVCButton')}
                </Button>
              </Actions>
            ) : (
              <Caption textAlign="center">{t('pages.home.sections.myAccount.noGlobalRoleUser.limitReached')}</Caption>
            )}
          </>
        ) : (
          <Gutters disablePadding disableGap>
            <Actions paddingY={gutters(0.5)}>
              <Button
                aria-label={t('pages.home.sections.myAccount.createVCButton')}
                variant="contained"
                sx={{ textTransform: 'none', paddingTop: gutters(0.5), paddingBottom: gutters(0.5), flex: 1 }}
                onClick={startWizard}
              >
                {t('pages.home.sections.myAccount.createYourVCButton')}
              </Button>
            </Actions>
          </Gutters>
        )}
      </Gutters>
    </>
  );
};

export default MyAccountBlockVCCampaignUser;
