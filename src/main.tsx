import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import App from './App.tsx';
import './index.css';

// Initialize Capacitor plugins
if (Capacitor.isNativePlatform()) {
  // Set status bar style
  StatusBar.setStyle({ style: 'DARK' });
  StatusBar.setBackgroundColor({ color: '#3b82f6' });
  
  // Hide splash screen after app is ready
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      SplashScreen.hide();
    }, 2000);
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
