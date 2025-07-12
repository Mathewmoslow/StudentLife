import React, { useState } from 'react';
import { useScheduleStore } from '../../stores/useScheduleStore';
import { format } from 'date-fns';

const BulkCompleteButton: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastCompleted, setLastCompleted] = useState<number>(0);
  
  const { tasks, updateTask } = useScheduleStore();
  
  const handleBulkComplete = () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    // Mark tasks older than 7 days as completed
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7);
    
    let count = 0;
    tasks.forEach(task => {
      const taskDueDate = new Date(task.dueDate);
      if (taskDueDate < cutoffDate && task.status !== 'completed') {
        updateTask(task.id, { status: 'completed' });
        count++;
      }
    });
    
    setLastCompleted(count);
    setIsProcessing(false);
    
    console.log(`✅ Marked ${count} old tasks (due before ${format(cutoffDate, 'MMM d')}) as completed`);
    
    // Auto-hide the success message after 3 seconds
    setTimeout(() => setLastCompleted(0), 3000);
  };
  
  // Count how many old tasks would be affected
  const getOldTaskCount = () => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7);
    
    return tasks.filter(task => {
      const taskDueDate = new Date(task.dueDate);
      return taskDueDate < cutoffDate && task.status !== 'completed';
    }).length;
  };
  
  const oldTaskCount = getOldTaskCount();
  
  // Don't show button if no old tasks
  if (oldTaskCount === 0) return null;
  
  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '20px', 
      right: '20px', 
      zIndex: 1000 
    }}>
      {lastCompleted > 0 && (
        <div style={{
          backgroundColor: '#10b981',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '6px',
          marginBottom: '8px',
          fontSize: '14px',
          textAlign: 'center'
        }}>
          ✅ Completed {lastCompleted} old tasks
        </div>
      )}
      
      <button 
        onClick={handleBulkComplete}
        disabled={isProcessing}
        style={{ 
          padding: '12px 16px',
          backgroundColor: isProcessing ? '#6b7280' : '#f59e0b',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: isProcessing ? 'not-allowed' : 'pointer',
          fontWeight: '600',
          fontSize: '14px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
        title={`Mark ${oldTaskCount} tasks older than 7 days as completed`}
      >
        {isProcessing ? (
          <>
            <span style={{ 
              width: '16px', 
              height: '16px', 
              border: '2px solid transparent',
              borderTop: '2px solid white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            Processing...
          </>
        ) : (
          <>
            🗂️ Complete {oldTaskCount} Old Tasks
          </>
        )}
      </button>
      
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default BulkCompleteButton;