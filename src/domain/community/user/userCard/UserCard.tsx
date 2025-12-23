import { MouseEventHandler, ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PersonIcon from '@mui/icons-material/Person';
import { Box, GridLegacy, IconButton, Skeleton, SvgIcon } from '@mui/material';
import Avatar from '@/core/ui/avatar/Avatar';
import ContributeCard from '@/core/ui/card/ContributeCard';
import BadgeCardView from '@/core/ui/list/BadgeCardView';
import { gutters } from '@/core/ui/grid/utils';
import ExpandableCardFooter from '@/core/ui/card/ExpandableCardFooter';
import { Caption } from '@/core/ui/typography';
import ImageBlurredSides from '@/core/ui/image/ImageBlurredSides';
import TagsComponent from '@/domain/shared/components/TagsComponent/TagsComponent';
import { noop } from 'lodash';

/* todo add jobTitle */
export interface UserCardProps {
  id?: string;
  avatarSrc?: string;
  avatarAltText?: string;
  displayName?: string;
  tags?: string[];
  url?: string;
  roleName?: ReactNode;
  city?: string;
  country?: string;
  loading?: boolean;
  isExpandable?: boolean;
  isContactable?: boolean;
  onContact?: () => void;
  onCardClick?: MouseEventHandler;
}

const UserCard = ({
  avatarSrc,
  avatarAltText,
  displayName = '',
  city,
  country,
  tags = [],
  url,
  roleName,
  loading,
  isContactable = true,
  onContact,
  onCardClick = noop,
  isExpandable = true,
}: UserCardProps) => {
  const { t } = useTranslation();
  const location = [city, country].filter(x => !!x).join(', ');
  const [isExpanded, setIsExpanded] = useState(false);
  const toggleExpanded: MouseEventHandler<HTMLDivElement> = event => {
    event.stopPropagation();
    event.preventDefault();
    setIsExpanded(wasExpanded => !wasExpanded);
  };

  if (loading) {
    return (
      <ContributeCard to={url} aria-label="user-card">
        <Box onClick={onCardClick} sx={{ cursor: onCardClick !== noop ? 'pointer' : 'default' }}>
          <Skeleton variant={'rectangular'}>
            <Avatar
              sx={{
                width: gutters(10),
                height: gutters(10),
              }}
            />
          </Skeleton>
        </Box>
      </ContributeCard>
    );
  }

  return (
    <ContributeCard to={url} aria-label="user-card">
      <Box onClick={onCardClick} sx={{ cursor: onCardClick !== noop ? 'pointer' : 'default' }}>
        {avatarSrc ? (
          <ImageBlurredSides
            src={avatarSrc}
            alt={t('common.avatar-of', { user: displayName })}
            blurRadius={1}
            sx={{ width: '50%' }}
          />
        ) : (
          <Avatar
            src={avatarSrc}
            alt={t('visuals-alt-text.avatar.contributor.text', {
              displayName,
              altText: avatarAltText,
            })}
            variant="rounded"
          >
            {displayName[0]}
          </Avatar>
        )}
        <BadgeCardView
          visualRight={
            isContactable ? (
              <IconButton
                aria-label={t('common.email')}
                onClick={event => {
                  event.preventDefault();
                  event.stopPropagation();
                  onContact?.();
                }}
              >
                <EmailOutlinedIcon color="primary" />
              </IconButton>
            ) : undefined
          }
          gap={1}
          height={gutters(3)}
          paddingY={1}
          paddingX={1.5}
        >
          <Caption fontSize={gutters(0.7)}>{displayName}</Caption>
          {roleName && <InfoRow text={roleName} icon={PersonIcon} ariaLabel="Role name" loading={loading} />}
          {location && (
            <InfoRow text={location} icon={LocationOnOutlinedIcon} ariaLabel={t('common.location')} loading={loading} />
          )}
        </BadgeCardView>
      </Box>

      {isExpandable ? (
        <Box onClick={toggleExpanded} sx={{ cursor: 'pointer' }}>
          <ExpandableCardFooter
            expanded={isExpanded}
            expandable={tags.length > 0}
            tags={<TagsComponent tags={tags} loading={loading} hideNoTagsMessage />}
          />
        </Box>
      ) : (
        <ExpandableCardFooter
          expandable={false}
          expanded={isExpanded}
          tags={<TagsComponent tags={tags} loading={loading} hideNoTagsMessage />}
        />
      )}
    </ContributeCard>
  );
};

export default UserCard;

type InfoRowProps = {
  icon: typeof SvgIcon;
  ariaLabel: string;
  text?: ReactNode;
  loading?: boolean;
};

const InfoRow = ({ icon: Icon, text, ariaLabel, loading }: InfoRowProps) => (
  <GridLegacy item xs={12} zeroMinWidth>
    <Box display="flex" alignItems="center">
      <Icon fontSize="small" />
      <Caption noWrap aria-label={ariaLabel} display="flex" flexGrow={1}>
        {loading ? <Skeleton width="70%" /> : text}
      </Caption>
    </Box>
  </GridLegacy>
);
