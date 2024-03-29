import React, { ComponentType, PropsWithChildren, ReactNode, useState } from 'react';
import { Box, SvgIconProps } from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import ContributeCard, { ContributeCardProps } from '../../../../core/ui/card/ContributeCard';
import BadgeCardView from '../../../../core/ui/list/BadgeCardView';
import RoundedIcon from '../../../../core/ui/icon/RoundedIcon';
import CardTags from '../../../../core/ui/card/CardTags';
import { gutters } from '../../../../core/ui/grid/utils';
import CardContent from '../../../../core/ui/card/CardContent';
import RouterLink from '../../../../core/ui/link/RouterLink';
import CardMatchedTerms from '../../../../core/ui/card/CardMatchedTerms';
import ExpandableCardFooter from '../../../../core/ui/card/ExpandableCardFooter';
import CardMemberIcon from '../../../community/membership/CardMemberIcon/CardMemberIcon';
import CardBanner from '../../../../core/ui/card/CardImageHeader';
import { useTranslation } from 'react-i18next';
import { JourneyCardBanner } from './Banner';
import defaultCardBanner from '../../defaultVisuals/Card.jpg';

export interface JourneyCardProps extends ContributeCardProps {
  iconComponent: ComponentType<SvgIconProps>;
  header: ReactNode;
  banner?: JourneyCardBanner;
  tags: string[];
  journeyUri?: string;
  expansion?: ReactNode;
  expansionActions?: ReactNode;
  ribbon?: ReactNode;
  member?: boolean;
  locked?: boolean;
  actions?: ReactNode;
  matchedTerms?: boolean; // TODO pass ComponentType<CardTags> instead
}

const JourneyCard = ({
  iconComponent: Icon,
  header,
  banner,
  tags,
  journeyUri,
  expansion,
  expansionActions,
  ribbon,
  member,
  locked,
  actions,
  matchedTerms = false,
  children,
  ...containerProps
}: PropsWithChildren<JourneyCardProps>) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const canBeExpanded = !!expansion;

  const toggleExpanded = () => setIsExpanded(wasExpanded => !wasExpanded);

  const Tags = matchedTerms ? CardMatchedTerms : CardTags;

  const wrapperProps = journeyUri
    ? ({
        component: RouterLink,
        to: journeyUri,
      } as const)
    : {};

  return (
    <ContributeCard {...containerProps}>
      <Box {...wrapperProps}>
        <CardBanner
          src={banner?.uri || defaultCardBanner}
          alt={t('visuals-alt-text.banner.card.text', { altText: banner?.alternativeText })}
          overlay={
            <>
              {ribbon}
              {member && <CardMemberIcon top={gutters(ribbon ? 2.0 : 0.5)} />}
            </>
          }
        />
        <BadgeCardView
          visual={<RoundedIcon size="small" component={Icon} />}
          visualRight={locked ? <LockOutlined fontSize="small" color="primary" /> : undefined}
          gap={1}
          height={gutters(3)}
          paddingY={1}
          paddingX={1.5}
        >
          {header}
        </BadgeCardView>
      </Box>
      <Box onClick={canBeExpanded ? toggleExpanded : undefined} sx={{ cursor: 'pointer' }} paddingBottom={1}>
        <CardContent flexGrow={1}>{children}</CardContent>
        <ExpandableCardFooter
          expanded={isExpanded}
          expandable={canBeExpanded}
          expansion={expansion}
          actions={actions}
          expansionActions={expansionActions}
          tags={<Tags tags={tags} disableIndentation />}
        />
      </Box>
    </ContributeCard>
  );
};

export default JourneyCard;
