import React, { useState } from 'react';
import { autoScheduleTasks } from '../../stores/scheduleActions';
import styles from './AutoScheduleButton.module.css';

/**
 * Basic Auto-Schedule Button
 * Creates study/work blocks (DO blocks) based on:
 * - Task due dates
 * - Default buffer days (exam: 7 days, assignment: 3 days, etc.)
 * - Simple time distribution
 */

export const AutoScheduleButton: React.FC = () => {
  const [isScheduling, setIsScheduling] = useState(false);
  const [result, setResult] = useState<{ tasksScheduled: number; blocksCreated: number } | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  
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
      <div className={styles.buttonGroup}>
        <button 
          onClick={handleAutoSchedule}
          disabled={isScheduling}
          className={styles.button}
          title="Basic scheduling based on due dates and buffer days"
        >
          {isScheduling ? (
            <>🔄 Scheduling...</>
          ) : (
            <>📅 Basic Auto-Schedule</>
          )}
        </button>
        <button
          onClick={() => setShowHelp(!showHelp)}
          className={styles.helpButton}
          title="What's the difference?"
        >
          ❓
        </button>
      </div>
      
      {showHelp && (
        <div className={styles.helpBox}>
          <strong>📅 Basic Auto-Schedule:</strong> Creates DO blocks based on due dates and default buffer days (3-7 days before due). Simple and fast.
          <br/><br/>
          <strong>🧠 Smart Study Scheduler:</strong> Advanced algorithmic optimization that analyzes:
          <ul style={{ marginTop: '0.5rem', marginBottom: 0, paddingLeft: '1.2rem' }}>
            <li>Your energy patterns throughout the week</li>
            <li>Preferred study times (morning/afternoon/evening)</li>
            <li>Course difficulty and workload distribution</li>
            <li>Existing calendar conflicts</li>
            <li>Optimal break times between sessions</li>
          </ul>
        </div>
      )}
      
      {result && (
        <div className={styles.result}>
          ✅ Created {result.blocksCreated} DO blocks for {result.tasksScheduled} tasks!
        </div>
      )}
    </div>
  );
};
