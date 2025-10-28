import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('portal_token');
  const tokenCreated = localStorage.getItem('token_created');

  // Check if token exists
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Check token expiration (24 hours)
  if (tokenCreated) {
    const created = new Date(tokenCreated);
    const now = new Date();
    const hoursDiff = (now - created) / (1000 * 60 * 60);
    
    if (hoursDiff >= 24) {
      // Token expired, clear storage and redirect to login
      localStorage.removeItem('portal_token');
      localStorage.removeItem('token_created');
      return <Navigate to="/login" replace />;
    }
  }

  return children;
}
