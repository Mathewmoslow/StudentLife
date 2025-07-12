import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/dashboard/Dashboard';
import Timeline3D from './components/timeline/Timeline3D';
import SchedulerView from './components/scheduler/SchedulerView';
import TaskList from './components/tasks/TaskList';
import Settings from './components/settings/Settings';
import Navigation from './components/common/Navigation';
import { DataLoader } from './services/dataLoader';
import { useScheduleStore } from './stores/useScheduleStore';
import './styles/global.css';

function App() {
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const { tasks, events, courses } = useScheduleStore();

  useEffect(() => {
    // Only load sample data if the store is empty
    const hasExistingData = tasks.length > 0 || events.length > 0 || courses.length > 0;
    
    if (!hasExistingData && !isDataLoaded) {
      console.log('Loading nursing sample data...');
      try {
        DataLoader.loadNursingData();
        setIsDataLoaded(true);
        console.log('Sample data loaded successfully');
      } catch (error) {
        console.error('Error loading sample data:', error);
      }
    } else if (hasExistingData) {
      setIsDataLoaded(true);
    }
  }, [tasks.length, events.length, courses.length, isDataLoaded]);

  return (
    <Router>
      <div className="app">
        <Navigation />
        <main className="main-content">
          {!isDataLoaded ? (
            <div className="loading-screen">
              <h2>Loading StudentLife...</h2>
              <p>Setting up your schedule...</p>
            </div>
          ) : (
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/timeline" element={<Timeline3D />} />
              <Route path="/schedule" element={<SchedulerView />} />
              <Route path="/tasks" element={<TaskList />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          )}
        </main>
      </div>
    </Router>
  );
}

export default App;