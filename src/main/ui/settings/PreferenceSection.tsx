import React, { FC } from 'react';
import DashboardGenericSection from '@/_deprecated/DashboardGenericSection/DashboardGenericSection';
import { FormControl, FormControlLabel, FormGroup, Skeleton, Switch } from '@mui/material';
import { Preference, PreferenceType } from '@/core/apollo/generated/graphql-schema';

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
    <DashboardGenericSection headerText={headerText} subHeaderText={subHeaderText} headerSpacing="none">
      {loading ? (
        <>
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </>
      ) : (
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
      )}
    </DashboardGenericSection>
  );
};

export default PreferenceSection;
