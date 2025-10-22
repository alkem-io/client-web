import React from 'react';
import { Box, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper } from '@mui/material';
import { Caption } from '@/core/ui/typography';
import { useTranslation } from 'react-i18next';
import { DataPoint } from './types';

const StateProps = ({ promptGraph }) => {
  const { t } = useTranslation();
  const stateProps = (promptGraph?.state?.properties || promptGraph?.state?.output?.properties || []) as DataPoint[];

  if (stateProps && stateProps.length > 0) {
    return (
      <Box sx={{ flex: '0 0 30%' }}>
        <Caption sx={{ fontWeight: 600 }}>
          {t('pages.virtualContributorProfile.settings.promptGraph.statePropertiesTitle')}
        </Caption>

        <TableContainer component={Paper} sx={{ marginTop: 1 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ borderBottom: '2px solid', borderColor: 'divider' }}>
                <TableCell>
                  {t('pages.virtualContributorProfile.settings.promptGraph.propertyTable.columns.name')}
                </TableCell>
                <TableCell>
                  {t('pages.virtualContributorProfile.settings.promptGraph.propertyTable.columns.type')}
                </TableCell>
                <TableCell>
                  {t('pages.virtualContributorProfile.settings.promptGraph.propertyTable.columns.optional')}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stateProps.map((prop, idx) => (
                <React.Fragment key={`state-prop-${idx}`}>
                  <TableRow key={`row-main-${idx}`}>
                    <TableCell>
                      {prop?.name ||
                        t('pages.virtualContributorProfile.settings.promptGraph.propertyTable.notAvailable')}
                    </TableCell>
                    <TableCell>
                      {prop?.type ||
                        t('pages.virtualContributorProfile.settings.promptGraph.propertyTable.notAvailable')}
                    </TableCell>
                    <TableCell>
                      {prop?.optional
                        ? t('pages.virtualContributorProfile.settings.promptGraph.propertyTable.yes')
                        : t('pages.virtualContributorProfile.settings.promptGraph.propertyTable.no')}
                    </TableCell>
                  </TableRow>
                  <TableRow key={`row-desc-${idx}`} sx={{ borderBottom: '2px solid', borderColor: 'divider' }}>
                    <TableCell colSpan={3} sx={{ color: 'text.secondary' }}>
                      {prop?.description ||
                        t('pages.virtualContributorProfile.settings.promptGraph.propertyTable.notAvailable')}
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  }

  return (
    <Caption sx={{ marginTop: 1 }}>
      {t('pages.virtualContributorProfile.settings.promptGraph.noStateProperties')}
    </Caption>
  );
};

export default StateProps;
