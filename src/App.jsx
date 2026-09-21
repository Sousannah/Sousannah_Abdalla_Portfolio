import { Suspense, lazy, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import Home from './pages/Home.jsx';
import { AuthProvider, RequireAuth } from './lib/auth.jsx';
import { ContentProvider } from './lib/content.jsx';
import { initTracker } from './lib/tracker.js';

// The dashboard is only ever loaded by one person, so it stays out of the
// bundle every visitor downloads.
const Login = lazy(() => import('./pages/Login.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));

function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-sunken dark:bg-night">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-black/10 border-t-accent
        dark:border-white/10 dark:border-t-accent" />
    </div>
  );
}

export default function App() {
  useEffect(() => {
    initTracker();
  }, []);

  return (
    // reducedMotion="user" makes every animation below respect the OS setting;
    // the CSS media query alone cannot reach framer-motion's JS animations.
    <MotionConfig reducedMotion="user">
      <ContentProvider>
        <AuthProvider>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/dashboard/*"
                element={
                  <RequireAuth>
                    <Dashboard />
                  </RequireAuth>
                }
              />
              <Route path="*" element={<Home />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </ContentProvider>
    </MotionConfig>
  );
}
