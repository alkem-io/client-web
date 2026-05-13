import { Box } from '@mui/material';
import AdminLayout from '@/domain/platformAdmin/layout/toplevel/AdminLayout';
import { AdminSection } from '@/domain/platformAdmin/layout/toplevel/constants';

const AdminLayoutPage = () => {
  return (
    <AdminLayout currentTab={AdminSection.Layout}>
      <Box sx={{ padding: 2 }} />
    </AdminLayout>
  );
};

export default AdminLayoutPage;
