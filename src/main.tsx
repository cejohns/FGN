import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './lib/auth.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { analytics } from './lib/analytics';
import './index.css';

// Log analytics status on app start
console.log('%c🚀 FireStar Gaming Network', 'color: #ff6b35; font-size: 16px; font-weight: bold;');
console.log('%c📊 Analytics Debugging Enabled', 'color: #4285f4; font-weight: bold;');
console.log('Run analytics.isLoaded() to check status');
console.log('Run analytics.debugDataLayer() to see all events');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>
);
