import { useTranslation } from 'react-i18next';
import CountrySelect from './CountrySelect';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import Gutters from '@/core/ui/grid/Gutters';
import { useScreenSize } from '@/core/ui/grid/constants';

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
    <Gutters disablePadding row={!isSmallScreen}>
      <FormikInputField
        name={cityFieldName}
        title={t('components.profileSegment.location.city.name')}
        placeholder={t('components.profileSegment.location.city.placeholder')}
        readOnly={readonly}
        disabled={disabled}
        required={required}
        fullWidth
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
