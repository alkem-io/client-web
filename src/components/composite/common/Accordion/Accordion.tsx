import React, { FC } from 'react';
import MuiAccordion from '@mui/material/Accordion/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Box from '@mui/material/Box';
import HelpButton from '../../../core/HelpButton';

export interface AccordionProps {
  title: string;
  subtitle?: string;
  helpText?: string;
  ariaKey: string;
}

export const Accordion: FC<AccordionProps> = ({ children, title, subtitle, helpText, ariaKey }) => {
  return (
    <MuiAccordion defaultExpanded={true}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ fontSize: 60, color: 'primary.main' }} />}
        aria-controls={`panel-${ariaKey}-content`}
        id={`panel-${ariaKey}-header`}
      >
        <Box paddingY={2}>
          <Box display="flex" alignItems="center">
            <Box
              component={Typography}
              variant="h3"
              sx={{
                paddingBottom: t => t.spacing(0.5),
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {title}
              {helpText && <HelpButton helpText={helpText} fontSize="inherit" />}
            </Box>
          </Box>
          {subtitle && <Typography variant="subtitle1">{subtitle}</Typography>}
        </Box>
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </MuiAccordion>
  );
};
