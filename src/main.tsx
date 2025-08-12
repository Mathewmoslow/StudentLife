import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/global.css'
import { useScheduleStore } from './stores/useScheduleStore'

// Debug: Check initial store state
const initialState = useScheduleStore.getState();
console.log('🚀 App Starting - Initial Store State:', {
  courses: initialState.courses?.length || 0,
  tasks: initialState.tasks?.length || 0,
  events: initialState.events?.length || 0,
  timeBlocks: initialState.timeBlocks?.length || 0,
  hasData: !!(initialState.courses?.length || initialState.tasks?.length)
});

// Debug: Check localStorage
const storedData = localStorage.getItem('schedule-store');
if (storedData) {
  try {
    const parsed = JSON.parse(storedData);
    console.log('📦 localStorage Data Found:', {
      version: parsed.version,
      hasState: !!parsed.state,
      stateKeys: parsed.state ? Object.keys(parsed.state) : []
    });
  } catch (e) {
    console.error('❌ Failed to parse localStorage data:', e);
  }
} else {
  console.log('📭 No localStorage data found - fresh start');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)