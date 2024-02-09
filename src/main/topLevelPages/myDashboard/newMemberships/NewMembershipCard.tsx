import BadgeCardView from '../../../../core/ui/list/BadgeCardView';
import { JourneyDetails } from '../../../../domain/community/pendingMembership/PendingMemberships';
import { Avatar, ButtonBase, ListItemButton, ListItemButtonProps, ListItemButtonTypeMap } from '@mui/material';
import { Caption } from '../../../../core/ui/typography';
import { Trans, useTranslation } from 'react-i18next';
import { gutters } from '../../../../core/ui/grid/utils';
import defaultJourneyAvatar from '../../../../domain/journey/defaultVisuals/Avatar.jpg';

interface NewMembershipCardProps {
  membership: JourneyDetails | undefined;
  to?: string;
  onClick?: () => void;
  membershipType: 'application' | 'invitation' | 'membership';
}

const Wrapper = <D extends React.ElementType = ListItemButtonTypeMap['defaultComponent'], P = {}>({
  ...props
}: ListItemButtonProps<D, P>) => <ListItemButton component={ButtonBase} {...props} />;

const NewMembershipCard = ({ membership, to, onClick, membershipType }: NewMembershipCardProps) => {
  const { t } = useTranslation();

  return (
    <BadgeCardView
      component={Wrapper}
      visual={<Avatar src={membership?.journeyVisual?.uri || defaultJourneyAvatar} />}
      to={to}
      onClick={onClick}
      sx={{ textAlign: 'left', paddingLeft: gutters(0.5), width: '100%' }}
    >
      <Caption whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
        <Trans
          t={t}
          i18nKey={`pages.home.sections.newMemberships.${membershipType}.message` as const}
          components={{
            b: <strong />,
          }}
          values={{
            journey: membership?.journeyDisplayName,
          }}
        />
      </Caption>
      <Caption color={theme => theme.palette.neutral.light}>
        {t(`pages.home.sections.newMemberships.${membershipType}.caption` as const, {
          tagline: membership?.journeyTagline,
        })}
      </Caption>
    </BadgeCardView>
  );
};

export default NewMembershipCard;
