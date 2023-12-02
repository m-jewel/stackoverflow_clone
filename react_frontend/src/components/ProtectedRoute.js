// ProtectedRoute.js

import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import UserContext from '../context/UserContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(UserContext);

  if (!user) {
    // If not a user, we redirect them to the /register page
    return <Navigate to="/register" />;
  }

  return children;
}

export default ProtectedRoute;
