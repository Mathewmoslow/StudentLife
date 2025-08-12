import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Dashboard from './components/dashboard/Dashboard';
import Timeline3D from './components/timeline/Timeline3D';
import SchedulerView from './components/scheduler/SchedulerView';
import TaskList from './components/tasks/TaskList';
import Settings from './components/settings/Settings';
import Navigation from './components/common/Navigation';
import './styles/global.css';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="app">
          <Navigation />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/timeline" element={<Timeline3D />} />
              <Route path="/schedule" element={<SchedulerView />} />
              <Route path="/tasks" element={<TaskList />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;