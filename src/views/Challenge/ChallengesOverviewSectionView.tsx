import React, { FC } from 'react';
import Accordion from '@mui/material/Accordion/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Box from '@mui/material/Box';
import HelpButton from '../../components/core/HelpButton';
import Grid from '@mui/material/Grid';
import ChallengeCard from '../../components/composite/entities/Ecoverse/ChallengeCard';

export interface ChallengesOverviewSectionViewProps {
  title: string;
  subtitle: string;
  helpText: string;
  challenges: any[]; // todo type
  ariaKey: string;
}

export const ChallengesOverviewSectionView: FC<ChallengesOverviewSectionViewProps> = ({
  title,
  subtitle,
  helpText,
  challenges,
  ariaKey,
}) => {
  return (
    <Accordion>
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
        <Grid container>
          {challenges.map(({ id, activity, tags, url }, i) => (
            <Grid key={i} item lg={3} md={4} xs={12}>
              <ChallengeCard id={id} isMember={true} activity={activity} tags={tags} url={url} />
            </Grid>
          ))}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};
