import { Formik } from 'formik';
import FormikInputField from '../../../common/components/composite/forms/FormikInputField';
import { Box, BoxProps, Dialog } from '@mui/material';
import { useSearchContext } from './SearchContext';
import { useNavigate } from 'react-router-dom';
import MultipleSelect from '../pages/Search/MultipleSelect';

const DialogContainer = ({ className, ...props }: BoxProps) => {
  return <Box {...props} />;
};

const SearchDialog = () => {
  const { isSearchOpen, setIsSearchOpen } = useSearchContext();
  const navigate = useNavigate();

  const handleSearch = () => {
    setIsSearchOpen(false);
    navigate('../search');
  };

  return (
    <Dialog open={isSearchOpen} onClose={() => setIsSearchOpen(false)} PaperComponent={DialogContainer}>
      <MultipleSelect onChange={handleSearch} selectedTerms={[]} suggestions={[]} minLength={2} disabled={false} />
      <Formik initialValues={{ search: '' }} onSubmit={handleSearch}>
        {({ submitForm }) => (
          <FormikInputField
            name="search"
            title="search"
            InputProps={{ sx: { backgroundColor: 'background.paper' } }}
            onBlur={submitForm}
          />
        )}
      </Formik>
    </Dialog>
  );
};

export default SearchDialog;
