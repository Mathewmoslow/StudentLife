import React from 'react';
import { Task } from '../../types';
import { format, formatDistanceToNow } from 'date-fns';
import styles from './TaskCard.module.css';

interface TaskCardProps {
  task: Task;
  isOverdue?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, isOverdue = false }) => {
  const getCourseInfo = () => {
    // In a real app, this would look up the course
    return 'CS 101';
  };
  
  const getComplexityLabel = () => {
    const labels = ['Very Easy', 'Easy', 'Medium', 'Hard', 'Very Hard'];
    return labels[task.complexity - 1];
  };
  
  const getTypeIcon = () => {
    const icons = {
      assignment: '📝',
      exam: '📊',
      project: '💻',
      reading: '📖',
      lab: '🔬'
    };
    return icons[task.type] || '📋';
  };
  
  return (
    <div className={`${styles.card} ${isOverdue ? styles.overdue : ''}`}>
      <div className={styles.header}>
        <span className={styles.typeIcon}>{getTypeIcon()}</span>
        <span className={styles.course}>{getCourseInfo()}</span>
      </div>
      
      <h3 className={styles.title}>{task.title}</h3>
      
      <div className={styles.meta}>
        <span className={styles.complexity}>
          {getComplexityLabel()} • {task.estimatedHours}h
        </span>
        <span className={styles.dueDate}>
          {isOverdue ? 'Overdue' : 'Due'} {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
        </span>
      </div>
      
      <div className={styles.progress}>
        <div 
          className={styles.progressBar} 
          style={{ 
            width: `${(task.scheduledBlocks.filter(b => b.completed).length / task.scheduledBlocks.length) * 100 || 0}%` 
          }}
        />
      </div>
      
      <div className={styles.actions}>
        <button className={styles.actionButton}>View Details</button>
        <button className={styles.actionButton}>Start Working</button>
      </div>
    </div>
  );
};

export default TaskCard;
