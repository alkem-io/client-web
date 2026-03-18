import { useTranslation } from 'react-i18next';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import { useScreenSize } from '@/core/ui/grid/constants';
import Gutters from '@/core/ui/grid/Gutters';
import CountrySelect from './CountrySelect';

type LocationSegmentProps = {
  cityFieldName?: string;
  countryFieldName?: string;
  readonly?: boolean;
  disabled?: boolean;
  required?: boolean;
};

export const LocationSegment = ({
  disabled,
  required,
  readonly,
  cityFieldName = 'city',
  countryFieldName = 'country',
}: LocationSegmentProps) => {
  const { t } = useTranslation();
  const { isSmallScreen } = useScreenSize();

  return (
    <Gutters disablePadding={true} row={!isSmallScreen}>
      <FormikInputField
        name={cityFieldName}
        title={t('components.profileSegment.location.city.name')}
        placeholder={t('components.profileSegment.location.city.placeholder')}
        readOnly={readonly}
        disabled={disabled}
        required={required}
        fullWidth={true}
      />
      <CountrySelect
        name={countryFieldName}
        title={t('components.profileSegment.location.country.name')}
        readOnly={readonly}
        disabled={disabled}
        required={required}
      />
    </Gutters>
  );
};
