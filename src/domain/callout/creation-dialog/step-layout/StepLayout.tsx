import React, { FC } from 'react';
import { Box } from '@mui/material';
import { DialogActions, DialogContent, DialogTitle } from '../../../../components/core/dialog';
import Button from '@mui/material/Button';
import createLayout from '../../../shared/layout/LayoutHolder';

export interface StepLayoutProps {
  title: string;
  next?: () => void;
  prev?: () => void;
  onClose: () => void;
}

export const StepLayoutImpl: FC<StepLayoutProps> = ({ children, title, onClose, next, prev }) => {
  return (
    <Box>
      <DialogTitle id="callout-creation-title" onClose={onClose}>
        {title}
      </DialogTitle>
      <DialogContent>
        {children}
      </DialogContent>
      <DialogActions>
        <Button onClick={next} disabled={!next}>next</Button>
        <Button onClick={prev} disabled={!prev}>prev</Button>
      </DialogActions>
    </Box>
  );
};

export interface StepSummaryLayoutProps {
  onClose: () => void;
}

export const StepSummaryLayoutImpl: FC<StepSummaryLayoutProps> = ({ children, onClose }) => {
  return (
    <Box>
      <DialogTitle id="callout-creation-title" onClose={onClose}>
        Summary
      </DialogTitle>
      <DialogContent>
        {children}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Finish</Button>
      </DialogActions>
    </Box>
  )
};

export const { LayoutHolder: StepLayoutHolder, Layout: StepLayout } = createLayout(StepLayoutImpl);
export const { Layout: StepSummaryLayout } = createLayout(StepSummaryLayoutImpl);
