import { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import CountrySelect from './CountrySelect';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import Gutters from '@/core/ui/grid/Gutters';

type LocationSegmentProps = {
  cols?: number;
  readonly?: boolean;
  disabled?: boolean;
  required?: boolean;
  cityFieldName?: string;
  countryFieldName?: string;
};

export const LocationSegment = (props: PropsWithChildren<LocationSegmentProps>) => {
  const { t } = useTranslation();
  const { disabled, required, readonly, cityFieldName, countryFieldName } = props;

  return (
    <Gutters>
      <CountrySelect
        name={countryFieldName ?? 'country'}
        title={t('components.profileSegment.location.country.name')}
        key="name"
        readOnly={readonly}
        disabled={disabled}
        required={required}
      />
      <FormikInputField
        name={cityFieldName ?? 'city'}
        title={t('components.profileSegment.location.city.name')}
        placeholder={t('components.profileSegment.location.city.placeholder')}
        readOnly={readonly}
        disabled={disabled}
        required={required}
      />
      {props.children}
    </Gutters>
  );
};
