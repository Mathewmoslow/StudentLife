import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/dashboard/Dashboard';
import SchedulerView from './components/scheduler/SchedulerView';
import TaskList from './components/tasks/TaskList';
import Settings from './components/settings/Settings';
import Navigation from './components/common/Navigation';
import DebugPanel from './components/common/DebugPanel';
import './styles/global.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/timeline" element={<Navigate to="/schedule" replace />} />
            <Route path="/schedule" element={<SchedulerView />} />
            <Route path="/tasks" element={<TaskList />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
        <DebugPanel />
      </div>
    </Router>
  );
}

export default App;
