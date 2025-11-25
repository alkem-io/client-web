import React from 'react';
import {
  Accordion as MuiAccordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  AccordionProps as MuiAccordionProps,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export interface AccordionProps extends Omit<MuiAccordionProps, 'children'> {
  summary: React.ReactNode;
  details: React.ReactNode;
}

export const Accordion: React.FC<AccordionProps> = ({ summary, details, ...props }) => {
  return (
    <MuiAccordion {...props}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        {typeof summary === 'string' ? <Typography>{summary}</Typography> : summary}
      </AccordionSummary>
      <AccordionDetails>{typeof details === 'string' ? <Typography>{details}</Typography> : details}</AccordionDetails>
    </MuiAccordion>
  );
};
