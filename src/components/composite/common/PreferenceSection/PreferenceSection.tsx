import React, { FC } from 'react';
import DashboardGenericSection from '../sections/DashboardGenericSection';
import { FormControl, FormControlLabel, FormGroup, Skeleton, Switch } from '@mui/material';
import {
  ChallengePreferenceType,
  OrganizationPreferenceType,
  Preference,
  UserPreferenceType,
} from '../../../../models/graphql-schema';

export type PreferenceTypes = UserPreferenceType | OrganizationPreferenceType | ChallengePreferenceType;

export interface PreferenceSectionProps {
  headerText: string;
  subHeaderText: string;
  preferences: Preference[];
  loading?: boolean;
  onUpdate: (id: string, type: PreferenceTypes, value: boolean) => void;
}

const PreferenceSection: FC<PreferenceSectionProps> = ({
  loading,
  headerText,
  subHeaderText,
  preferences,
  onUpdate,
}) => {
  return (
    <DashboardGenericSection headerText={headerText} subHeaderText={subHeaderText} headerSpacing={'none'}>
      {loading ? (
        <>
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </>
      ) : (
        <FormControl>
          <FormGroup>
            {preferences.map(({ value, definition, id }, i) => (
              <FormControlLabel
                key={i}
                aria-label={`preference-${definition.type}`}
                control={
                  <Switch
                    checked={value !== 'false'}
                    name={definition.type}
                    onChange={(event, checked) => onUpdate(id, event.target.name as PreferenceTypes, checked)}
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
