import { useEffect } from 'react';
import { App } from '@capacitor/app';
import { useNavigate, useLocation } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';

const BackButtonHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const handleBackButton = async () => {
      // If we are on the landing page or dashboard, exit the app
      if (location.pathname === '/' || location.pathname === '/dashboard' || location.pathname === '/login') {
        App.exitApp();
      } else {
        // Otherwise, go back
        navigate(-1);
      }
    };

    const addListener = async () => {
      await App.addListener('backButton', handleBackButton);
    };

    addListener();

    // No need to remove listener in Capacitor 3+ if we want it global,
    // but good practice to clean up if component unmounts.
    // However, this component will stay mounted at the top level.
  }, [location, navigate]);

  return null;
};

export default BackButtonHandler;
