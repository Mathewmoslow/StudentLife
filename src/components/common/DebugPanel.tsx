// Create src/components/common/DebugPanel.tsx for troubleshooting
import React from 'react';
import { useScheduleStore } from '../../stores/useScheduleStore';

const DebugPanel: React.FC = () => {
  const { courses, tasks, events, timeBlocks, rescheduleAllTasks } = useScheduleStore();
  
  const handleForceSchedule = () => {
    console.log('=== FORCE SCHEDULING ===');
    console.log('Current state:');
    console.log('Courses:', courses.length);
    console.log('Tasks:', tasks.length);
    console.log('Events:', events.length);
    console.log('Time blocks:', timeBlocks.length);
    
    console.log('Tasks details:', tasks.map(t => ({
      title: t.title,
      hours: t.estimatedHours,
      status: t.status,
      due: t.dueDate
    })));
    
    rescheduleAllTasks();
    
    setTimeout(() => {
      const newState = useScheduleStore.getState();
      console.log('After scheduling:');
      console.log('Time blocks:', newState.timeBlocks.length);
      console.log('Blocks:', newState.timeBlocks.map(b => ({
        taskId: b.taskId,
        start: b.startTime.toLocaleString(),
        end: b.endTime.toLocaleString(),
        type: b.type
      })));
    }, 1000);
  };
  
  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '20px', 
      right: '20px', 
      background: '#1f2937', 
      border: '1px solid #374151',
      borderRadius: '8px',
      padding: '16px',
      color: '#f9fafb',
      fontSize: '12px',
      zIndex: 1000,
      maxWidth: '300px'
    }}>
      <h4>Debug Panel</h4>
      <div>Courses: {courses.length}</div>
      <div>Tasks: {tasks.length}</div>
      <div>Events: {events.length}</div>
      <div>Time Blocks: {timeBlocks.length}</div>
      <div>Study Blocks: {timeBlocks.filter(b => b.type === 'study').length}</div>
      
      <button 
        onClick={handleForceSchedule}
        style={{
          marginTop: '8px',
          padding: '4px 8px',
          background: '#6366f1',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Force Re-schedule
      </button>
      
      <div style={{ marginTop: '8px', fontSize: '10px' }}>
        <div>Tasks with hours:</div>
        {tasks.filter(t => t.estimatedHours > 0).map(t => (
          <div key={t.id}>{t.title}: {t.estimatedHours}h</div>
        ))}
      </div>
    </div>
  );
};

export default DebugPanel;