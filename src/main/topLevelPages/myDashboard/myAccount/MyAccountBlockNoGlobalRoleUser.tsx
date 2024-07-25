import { Trans, useTranslation } from 'react-i18next';
import { Button, ListItemButton, ListItemButtonProps, ListItemButtonTypeMap } from '@mui/material';
import { gutters } from '../../../../core/ui/grid/utils';
import { BlockSectionTitle, Caption } from '../../../../core/ui/typography';
import BadgeCardView from '../../../../core/ui/list/BadgeCardView';
import Avatar from '../../../../core/ui/avatar/Avatar';
import defaultJourneyAvatar from '../../../../domain/journey/defaultVisuals/Avatar.jpg';
import RouterLink, { RouterLinkProps } from '../../../../core/ui/link/RouterLink';
import Gutters from '../../../../core/ui/grid/Gutters';
import { Actions } from '../../../../core/ui/actions/Actions';
import { MyAccountSpace, MyAccountVirtualContributor } from './MyAccountBlock';

interface MyAccountBlockNoGlobalRoleUserProps {
  hostedSpace: MyAccountSpace | undefined;
  virtualContributors: MyAccountVirtualContributor[];
  startWizard: () => void;
}

const VIRTUAL_CONTRIBUTORS_LIMIT = 3;

const MyAccountBlockNoGlobalRoleUser = ({
  hostedSpace,
  virtualContributors,
  startWizard,
}: MyAccountBlockNoGlobalRoleUserProps) => {
  const { t } = useTranslation();
  const hasVirtualCointributors = Boolean(virtualContributors && virtualContributors.length > 0);

  const Wrapper = <D extends React.ElementType = ListItemButtonTypeMap['defaultComponent'], P = {}>(
    props: ListItemButtonProps<D, P> & RouterLinkProps
  ) => <ListItemButton component={RouterLink} {...props} />;

  return (
    <>
      <Gutters disablePadding disableGap>
        <Caption>{t('pages.home.sections.myAccount.hostedSpaces')}</Caption>
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
          <Caption paddingTop={gutters(0.5)}>
            <Trans
              i18nKey="pages.home.sections.myAccount.noGlobalRoleUser.spaceSection"
              components={{
                pricing: <RouterLink to="https://welcome.alkem.io/pricing/" underline="always" />,
              }}
            />
          </Caption>
        )}
      </Gutters>
      <Gutters disablePadding disableGap>
        <Caption>{t('pages.home.sections.myAccount.virtualContributors')}</Caption>
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
          <>
            <Caption paddingTop={gutters(0.5)}>
              <Trans
                i18nKey="pages.home.sections.myAccount.noGlobalRoleUser.vcSectionLink"
                components={{
                  vc: <RouterLink to="https://welcome.alkem.io/virtual-contributors/" underline="always" />,
                }}
              />
            </Caption>
            <Caption>
              {hostedSpace
                ? t('pages.home.sections.myAccount.noGlobalRoleUser.joinSection')
                : t('pages.home.sections.myAccount.noGlobalRoleUser.vcSection')}
            </Caption>
            <Actions paddingY={gutters(0.5)}>
              <Button
                component={RouterLink}
                to={'https://welcome.alkem.io/vc-program/'}
                aria-label={t('pages.home.sections.myAccount.noGlobalRoleUser.joinButton')}
                variant="contained"
                sx={{ textTransform: 'none', paddingTop: gutters(0.5), paddingBottom: gutters(0.5), flex: 1 }}
              >
                {t('pages.home.sections.myAccount.noGlobalRoleUser.joinButton')}
              </Button>
            </Actions>
          </>
        )}
      </Gutters>
    </>
  );
};

export default MyAccountBlockNoGlobalRoleUser;
