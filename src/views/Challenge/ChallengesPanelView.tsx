import React, { FC } from 'react';
import Accordion from '@mui/material/Accordion/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Box from '@mui/material/Box';
import HelpButton from '../../components/core/HelpButton';
import ChallengeCard from '../../components/composite/entities/Ecoverse/ChallengeCard';
import { CardContainer } from '../../components/core/CardContainer';
import { useUserContext } from '../../hooks';

export interface ChallengesOverviewHubViewProps {
  title: string;
  subtitle: string;
  helpText: string;
  challenges: any[]; // todo type
  ariaKey: string;
}

export const ChallengesPanelView: FC<ChallengesOverviewHubViewProps> = ({
  title,
  subtitle,
  helpText,
  challenges,
  ariaKey,
}) => {
  const { user } = useUserContext();

  return (
    <Accordion elevation={0} defaultExpanded={true}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`panel-${ariaKey}-content`}
        id={`panel-${ariaKey}-header`}
      >
        <Box paddingY={2}>
          <Box display="flex" alignItems="center">
            <Typography variant="h3" sx={{ paddingBottom: t => t.spacing(0.5) }}>
              {title}
            </Typography>
            <HelpButton helpText={helpText} />
          </Box>
          <Typography variant="subtitle2">{subtitle}</Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <CardContainer>
          {challenges.map((challenge, i) => (
            <ChallengeCard
              key={i}
              id={challenge.id}
              displayName={challenge.displayName}
              activity={challenge?.activity || []}
              context={{
                tagline: challenge?.context?.tagline || '',
                visual: { background: challenge?.context?.visual?.background || '' },
              }}
              isMember={user?.ofChallenge(challenge.id) || false}
              tags={challenge?.tagset?.tags || []}
              url={challenge?.url}
            />
          ))}
        </CardContainer>
      </AccordionDetails>
    </Accordion>
  );
};
