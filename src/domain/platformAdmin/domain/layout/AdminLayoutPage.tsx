import { Box, FormControlLabel, Switch, Typography } from '@mui/material';
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

  const handleChange = (_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    try {
      if (checked) {
        localStorage.setItem(CRD_STORAGE_KEY, 'true');
      } else {
        localStorage.removeItem(CRD_STORAGE_KEY);
      }
    } catch {
      return;
    }
    setIsNewDesign(checked);
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
        <FormControlLabel
          control={<Switch checked={isNewDesign} onChange={handleChange} />}
          label="Use the new design"
        />
      </Box>
    </AdminLayout>
  );
};

export default AdminLayoutPage;
