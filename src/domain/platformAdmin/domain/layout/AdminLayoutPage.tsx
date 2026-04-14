import { Box, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, Typography } from '@mui/material';
import { useState } from 'react';
import AdminLayout from '@/domain/platformAdmin/layout/toplevel/AdminLayout';
import { AdminSection } from '@/domain/platformAdmin/layout/toplevel/constants';

const CRD_STORAGE_KEY = 'alkemio-crd-enabled';

const AdminLayoutPage = () => {
  const [isNewDesign, setIsNewDesign] = useState(() => {
    try {
      return localStorage.getItem(CRD_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const useNew = event.target.value === 'new';
    try {
      if (useNew) {
        localStorage.setItem(CRD_STORAGE_KEY, 'true');
      } else {
        localStorage.removeItem(CRD_STORAGE_KEY);
      }
    } catch {
      return;
    }
    setIsNewDesign(useNew);
    location.reload();
  };

  return (
    <AdminLayout currentTab={AdminSection.Layout}>
      <Box sx={{ padding: 2 }}>
        <Typography variant="h5" gutterBottom={true}>
          Design System
        </Typography>
        <Typography variant="body1" sx={{ marginBottom: 2 }}>
          Switch between the old and new page design. This setting is stored in your browser and only affects your
          session.
        </Typography>
        <FormControl>
          <FormLabel>Active design</FormLabel>
          <RadioGroup value={isNewDesign ? 'new' : 'old'} onChange={handleChange}>
            <FormControlLabel value="old" control={<Radio />} label="Old design" />
            <FormControlLabel value="new" control={<Radio />} label="New design" />
          </RadioGroup>
        </FormControl>
      </Box>
    </AdminLayout>
  );
};

export default AdminLayoutPage;
