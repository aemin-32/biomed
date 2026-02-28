
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// @ts-ignore
import { App as CapacitorApp } from '@capacitor/app';

const BackButtonHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let backListener: any;

    const setupListener = async () => {
      // Check if running in a Capacitor environment to avoid errors on web
      const isCapacitor = typeof CapacitorApp !== 'undefined' && CapacitorApp.addListener;
      
      if (!isCapacitor) return;

      try {
        // Remove any existing listeners first to avoid duplicates
        await CapacitorApp.removeAllListeners();

        backListener = await CapacitorApp.addListener('backButton', (data: any) => {
          // Define root paths where the app should exit (or minimize)
          const rootPaths = ['/', '/login', '/nurse', '/store', '/dashboard'];

          // If we are on a root path, exit the app
          if (rootPaths.includes(location.pathname)) {
             CapacitorApp.exitApp();
          } else {
             // Otherwise, go back in history
             navigate(-1);
          }
        });
      } catch (err) {
        console.warn('BackButtonHandler: Failed to setup listener', err);
      }
    };

    setupListener();

    // Cleanup on unmount or location change
    return () => {
      if (backListener && typeof CapacitorApp !== 'undefined') {
        try {
            CapacitorApp.removeAllListeners();
        } catch (e) { /* ignore */ }
      }
    };
  }, [navigate, location]);

  return null; // This component renders nothing visually
};

export default BackButtonHandler;
