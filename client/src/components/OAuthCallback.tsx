// pages/OAuthCallback.tsx
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    
    if (token) {
      localStorage.setItem('token', token);
      navigate('/home');
    } else {
      // Handle error case
      navigate('/login');
    }
  }, [location, navigate]);

  return (
    <div>
      <p>Processing authentication...</p>
    </div>
  );
};

export default OAuthCallback;