import React, { FC } from 'react';
import { FormControl, FormControlLabel, FormGroup, Paper, Skeleton, Switch } from '@mui/material';
import { Preference, PreferenceType } from '@/core/apollo/generated/graphql-schema';
import SectionHeader from '@/domain/shared/components/Section/SectionHeader';
import { Caption } from '@/core/ui/typography';
import { gutters } from '@/core/ui/grid/utils';

export interface PreferenceSectionProps {
  headerText: string;
  subHeaderText: string;
  preferences: Preference[];
  loading?: boolean;
  submitting?: boolean;
  onUpdate: (id: string, type: PreferenceType, value: boolean) => void;
}

const PreferenceSection: FC<PreferenceSectionProps> = ({
  loading,
  submitting,
  headerText,
  subHeaderText,
  preferences,
  onUpdate,
}) => {
  return (
    <Paper variant="outlined" sx={{ padding: gutters() }}>
      {loading ? (
        <>
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </>
      ) : (
        <>
          {headerText && <SectionHeader text={headerText} />}
          {subHeaderText && <Caption sx={{ paddingBottom: gutters(0.5) }}>{subHeaderText}</Caption>}
          <FormControl>
            <FormGroup>
              {preferences.map(({ value, definition, id }) => (
                <FormControlLabel
                  key={id}
                  aria-label={`preference-${definition.type}`}
                  control={
                    <Switch
                      checked={value !== 'false'}
                      name={definition.type}
                      onChange={(event, checked) => onUpdate(id, event.target.name as PreferenceType, checked)}
                      disabled={submitting}
                    />
                  }
                  label={definition.description}
                />
              ))}
            </FormGroup>
          </FormControl>
        </>
      )}
    </Paper>
  );
};

export default PreferenceSection;
