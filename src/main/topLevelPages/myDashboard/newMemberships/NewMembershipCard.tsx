import BadgeCardView from '../../../../core/ui/list/BadgeCardView';
import { JourneyDetails } from '../../../../domain/community/pendingMembership/PendingMemberships';
import { Avatar, ButtonBase, ListItemButton, ListItemButtonProps, ListItemButtonTypeMap } from '@mui/material';
import { Caption } from '../../../../core/ui/typography';
import { Trans, useTranslation } from 'react-i18next';
import JourneyIcon from '../../../../domain/shared/components/JourneyIcon/JourneyIcon';
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

  const JourneyIconComponent = membership && JourneyIcon[membership.journeyTypeName];

  return (
    <BadgeCardView
      component={Wrapper}
      visual={<Avatar src={membership?.journeyVisual?.uri || defaultJourneyAvatar} />}
      to={to}
      onClick={onClick}
      sx={{ textAlign: 'left' }}
    >
      <Caption whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
        <Trans
          t={t}
          i18nKey={`pages.home.sections.newMemberships.${membershipType}.message` as const}
          components={{
            journeyicon: JourneyIconComponent ? <JourneyIconComponent fontSize="inherit" /> : <span />,
            b: <strong />,
          }}
          values={{
            journey: membership?.journeyDisplayName,
          }}
        />
      </Caption>
      <Caption>
        {t(`pages.home.sections.newMemberships.${membershipType}.caption` as const, {
          tagline: membership?.journeyTagline,
        })}
      </Caption>
    </BadgeCardView>
  );
};

export default NewMembershipCard;
