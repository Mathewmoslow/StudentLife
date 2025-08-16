import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import { theme } from './theme/theme';
import ErrorBoundary from './components/ErrorBoundary';
import Welcome from './components/onboarding/Welcome';
import CanvasImport from './components/canvas/CanvasImport';
import Dashboard from './components/dashboard/Dashboard';
import Timeline3D from './components/timeline/Timeline3D';
import SchedulerView from './components/scheduler/SchedulerView';
import TaskList from './components/tasks/TaskList';
import Settings from './components/settings/Settings';
import Navigation from './components/common/Navigation';
import { useScheduleStore } from './stores/useScheduleStore';

function AppContent() {
  const location = useLocation();
  const { tasks, courses } = useScheduleStore();
  const [isFirstTimeUser, setIsFirstTimeUser] = useState<boolean | null>(null);
  
  useEffect(() => {
    // For development: always show welcome if URL param is set
    const urlParams = new URLSearchParams(window.location.search);
    const forceWelcome = urlParams.get('welcome') === 'true';
    
    if (forceWelcome) {
      setIsFirstTimeUser(true);
      return;
    }
    
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    const hasData = tasks.length > 0 || courses.length > 0;
    setIsFirstTimeUser(!hasSeenWelcome && !hasData);
  }, [tasks.length, courses.length]);

  // Don't show navigation on welcome and canvas import pages
  const hideNavigation = location.pathname === '/' || 
                         location.pathname === '/welcome' || 
                         location.pathname === '/canvas-import';

  if (isFirstTimeUser === null) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">Loading...</Box>;
  }

  return (
    <Box display="flex" minHeight="100vh" bgcolor="background.default">
      {!hideNavigation && <Navigation />}
      <Box 
        component="main" 
        flexGrow={1}
        sx={{ 
          marginLeft: hideNavigation ? 0 : '240px',
          transition: 'margin-left 0.3s ease'
        }}
      >
        <Routes>
          <Route path="/" element={
            isFirstTimeUser ? <Welcome /> : <Navigate to="/dashboard" replace />
          } />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/canvas-import" element={<CanvasImport />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/timeline" element={<Timeline3D />} />
          <Route path="/schedule" element={<SchedulerView />} />
          <Route path="/tasks" element={<TaskList />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Box>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <Router>
          <AppContent />
        </Router>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;