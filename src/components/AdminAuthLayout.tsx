import { Outlet } from 'react-router-dom';
import { AuthProvider } from './Admin/Providers/AuthProvider';

export const AdminAuthLayout = () => (
  <AuthProvider>
    <Outlet />
  </AuthProvider>
);