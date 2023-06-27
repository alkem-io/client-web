import { Box, BoxProps, Dialog } from '@mui/material';
import { useSearchContext } from './SearchContext';
import { useNavigate } from 'react-router-dom';
import MultipleSelect from '../../../core/ui/search/MultipleSelect';
import GridItem from '../../../core/ui/grid/GridItem';
import GridProvider from '../../../core/ui/grid/GridProvider';
import { SEARCH_TERMS_PARAM } from '../routes/constants';
import { gutters } from '../../../core/ui/grid/utils';

const DialogContainer = ({ className, ...props }: BoxProps) => {
  return (
    <GridItem columns={6}>
      <Box {...props} marginTop={gutters(17)} />
    </GridItem>
  );
};

interface SearchDialogProps {
  searchRoute: string;
}

const SearchDialog = ({ searchRoute }: SearchDialogProps) => {
  const { isSearchOpen, closeSearch } = useSearchContext();
  const navigate = useNavigate();

  const handleSearch = (terms: string[]) => {
    closeSearch();
    const params = new URLSearchParams();
    for (const term of terms) {
      params.append(SEARCH_TERMS_PARAM, term);
    }
    navigate(`${searchRoute}?${params}`);
  };

  return (
    <GridProvider columns={12}>
      <Dialog
        open={isSearchOpen}
        onClose={closeSearch}
        PaperComponent={DialogContainer}
        sx={{ '.MuiDialog-container': { alignItems: 'start' } }}
      >
        <MultipleSelect onChange={handleSearch} value={[]} minLength={2} autoFocus />
      </Dialog>
    </GridProvider>
  );
};

export default SearchDialog;
