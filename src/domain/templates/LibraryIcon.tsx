import { styled } from '@mui/material';
import ImportContactsTwoToneIcon from '@mui/icons-material/ImportContactsTwoTone';

// The original material icon has a shadow on the left page of the book.
// See https://mui.com/material-ui/material-icons/?query=contact&theme=Two+tone&selected=ImportContactsTwoTone
// This code hides that shadow in the book and leaves the icon more similar to the desired design
export const LibraryIcon = styled(ImportContactsTwoToneIcon)(() => ({
  '& path:nth-of-type(2)': {
    opacity: 0,
  },
}));
