import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import defaultCardBanner from '../../../../domain/journey/defaultVisuals/Card.jpg';
import GridItem from '../../../../core/ui/grid/GridItem';
import Gutters from '../../../../core/ui/grid/Gutters';
import BadgeCardView from '../../../../core/ui/list/BadgeCardView';
import Avatar from '../../../../core/ui/avatar/Avatar';
import RouterLink from '../../../../core/ui/link/RouterLink';
import { BlockSectionTitle, Caption } from '../../../../core/ui/typography';

interface MyMembershipsSpaceCardProps {
  displayName: string;
  tagline?: string;
  avatar?: string;
  url: string;
  roles?: string[];
}

const MyMembershipsSpaceCard = ({ displayName, tagline, avatar, url, roles }: MyMembershipsSpaceCardProps) => {
  const { t } = useTranslation();

  const [isExpanded, setIsExpanded] = useState(false);
  const toggleExpanded = () => setIsExpanded(wasExpanded => !wasExpanded);
  console.log(roles);

  return (
    <GridItem columns={12}>
      <Gutters flexDirection="row" justifyContent="space-between">
        <BadgeCardView
          visual={
            <Avatar
              src={avatar || defaultCardBanner}
              aria-label="Space avatar"
              alt={t('common.avatar-of', { space: displayName })}
            >
              {displayName[0]}
            </Avatar>
          }
          component={RouterLink}
          to={url}
        >
          <BlockSectionTitle>{displayName}</BlockSectionTitle>
          <BlockSectionTitle>{tagline}</BlockSectionTitle>
        </BadgeCardView>
        <Gutters flexDirection="row">
          <Caption color="primary">{roles?.map(role => t(`common.${role}` as const)).join(', ')}</Caption>
          <Button
            onClick={toggleExpanded}
            endIcon={isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            sx={{ paddingTop: 0 }}
            area-label={isExpanded ? t('buttons.collapse') : t('buttons.expand')}
          />
        </Gutters>
      </Gutters>
    </GridItem>
  );
};

export default MyMembershipsSpaceCard;
