import { Box } from '@mui/material';
import { Caption } from '@/core/ui/typography';
import startCase from 'lodash/startCase';

export const NodeVariables = ({ variables, available }: { variables?: string[]; available?: string[] }) => {
  const inputVars = variables || [];
  const availableList = available || [];

  // If nothing to show, render nothing
  if (inputVars.length === 0 && availableList.length === 0) return null;

  // Compute available variables that are not already shown in inputVars
  const shownSet = new Set(inputVars);
  const remainingAvailable = availableList.filter(v => !shownSet.has(v));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, marginBottom: 1 }}>
      {inputVars.length > 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Caption sx={{ marginRight: 1 }}>Input variables:</Caption>
          {inputVars.map((v: string, idx: number) => {
            const isLast = idx === inputVars.length - 1;
            const found = availableList.includes(v);
            return (
              <Caption
                key={`${v}-${idx}`}
                sx={{
                  color: found ? 'success.main' : 'error.main',
                  fontWeight: found ? 700 : 400,
                  fontStyle: found ? 'normal' : 'italic',
                  paddingX: 0,
                }}
              >
                {v}
                {!isLast && ', '}
              </Caption>
            );
          })}
        </Box>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <Caption sx={{ marginRight: 1 }}>Available input variables:</Caption>
        {remainingAvailable.length > 0 ? (
          remainingAvailable.map((v: string, idx: number) => (
            <Caption key={`${v}-avail-${idx}`} sx={{ color: 'text.primary', paddingX: 0 }}>
              {v}
              {idx < remainingAvailable.length - 1 ? ', ' : ''}
            </Caption>
          ))
        ) : (
          <Caption sx={{ color: 'text.secondary' }}>None</Caption>
        )}
      </Box>
    </Box>
  );
};
