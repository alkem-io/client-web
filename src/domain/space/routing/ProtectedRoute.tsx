import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  canActivate: boolean;
  redirectPath: string;
}

const ProtectedRoute = ({ canActivate, redirectPath }: ProtectedRouteProps) => {
  if (!canActivate) {
    return <Navigate to={redirectPath} replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
