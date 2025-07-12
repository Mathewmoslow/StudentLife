import React from 'react';
import { useScheduleStore } from '../../stores/useScheduleStore';
import styles from './Timeline3D.module.css';

const Timeline3D: React.FC = () => {
  const { tasks } = useScheduleStore();
  
  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <h2>3D Timeline View</h2>
        <div className={styles.legend}>
          <span className={styles.legendItem}>
            <div className={styles.legendColor} style={{ backgroundColor: '#4CAF50' }} />
            Assignment
          </span>
          <span className={styles.legendItem}>
            <div className={styles.legendColor} style={{ backgroundColor: '#f44336' }} />
            Exam
          </span>
          <span className={styles.legendItem}>
            <div className={styles.legendColor} style={{ backgroundColor: '#2196F3' }} />
            Project
          </span>
          <span className={styles.legendItem}>
            <div className={styles.legendColor} style={{ backgroundColor: '#FF9800' }} />
            Reading
          </span>
          <span className={styles.legendItem}>
            <div className={styles.legendColor} style={{ backgroundColor: '#9C27B0' }} />
            Lab
          </span>
        </div>
      </div>
      
      {/* Temporary 2D fallback while we fix the 3D issues */}
      <div style={{ 
        flex: 1, 
        background: 'var(--bg-tertiary)', 
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--spacing-xl)',
        gap: 'var(--spacing-lg)'
      }}>
        <h3>🔧 3D Timeline Temporarily Disabled</h3>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          We're fixing a compatibility issue with the 3D timeline. <br/>
          In the meantime, you can view your schedule in the Schedule tab.
        </p>
        
        {/* Simple task list as fallback */}
        <div style={{ 
          background: 'var(--bg-primary)', 
          padding: 'var(--spacing-lg)', 
          borderRadius: 'var(--radius-md)',
          width: '100%',
          maxWidth: '600px'
        }}>
          <h4>Your Tasks ({tasks.length})</h4>
          {tasks.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No tasks yet. Create some in the Tasks tab!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
              {tasks.slice(0, 5).map(task => (
                <div key={task.id} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  padding: 'var(--spacing-sm)',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-sm)'
                }}>
                  <span>{task.title}</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    {task.type} • Due {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                </div>
              ))}
              {tasks.length > 5 && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'center' }}>
                  ...and {tasks.length - 5} more tasks
                </p>
              )}
            </div>
          )}
        </div>
        
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          💡 The 3D timeline will show a spiral view of all your tasks ordered by due date
        </p>
      </div>
    </div>
  );
};

export default Timeline3D;