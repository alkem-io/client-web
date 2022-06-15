import React, { FC } from 'react';
import MuiAccordion from '@mui/material/Accordion/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Box from '@mui/material/Box';
import { Skeleton, SxProps } from '@mui/material';
import HelpButton from '../../../core/HelpButton';

export interface AccordionProps {
  title: string;
  subtitle?: string;
  helpText?: string;
  loading?: boolean;
  ariaKey: string;
  sx?: SxProps;
  summarySx?: SxProps;
}

export const Accordion: FC<AccordionProps> = ({
  children,
  title,
  subtitle,
  helpText,
  ariaKey,
  loading,
  sx,
  summarySx,
}) => {
  return (
    <MuiAccordion sx={sx} defaultExpanded>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ fontSize: 60, color: 'primary.main' }} />}
        aria-controls={`panel-${ariaKey}-content`}
        id={`panel-${ariaKey}-header`}
        sx={summarySx}
      >
        <Box display="flex" alignItems="center" paddingY={1}>
          <Box
            component={Typography}
            variant="h3"
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexGrow: 1,
            }}
          >
            {loading ? <Skeleton width="80%" /> : title}
            {helpText && (loading ? null : <HelpButton helpText={helpText} fontSize="inherit" />)}
          </Box>
          {subtitle && <Typography variant="subtitle1">{loading ? <Skeleton width="60%" /> : subtitle}</Typography>}
        </Box>
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </MuiAccordion>
  );
};
