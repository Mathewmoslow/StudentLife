import React, { useState } from 'react';
import { autoScheduleTasks } from '../../stores/scheduleActions';
import styles from './AutoScheduleButton.module.css';

export const AutoScheduleButton: React.FC = () => {
  const [isScheduling, setIsScheduling] = useState(false);
  const [result, setResult] = useState<{ tasksScheduled: number; blocksCreated: number } | null>(null);
  
  const handleAutoSchedule = async () => {
    setIsScheduling(true);
    setResult(null);
    
    // Simulate processing time for better UX
    setTimeout(() => {
      const scheduleResult = autoScheduleTasks();
      setResult(scheduleResult);
      setIsScheduling(false);
      
      // Clear result after 5 seconds
      setTimeout(() => setResult(null), 5000);
    }, 1000);
  };
  
  return (
    <div className={styles.container}>
      <button 
        onClick={handleAutoSchedule}
        disabled={isScheduling}
        className={styles.button}
      >
        {isScheduling ? (
          <>🔄 Scheduling...</>
        ) : (
          <>🗓️ Auto-Schedule All Tasks</>
        )}
      </button>
      
      {result && (
        <div className={styles.result}>
          ✅ Scheduled {result.tasksScheduled} tasks with {result.blocksCreated} study blocks!
        </div>
      )}
    </div>
  );
};
