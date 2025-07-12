import React, { useState } from 'react';
import { useScheduleStore } from '../../stores/useScheduleStore';
import TaskForm from './TaskForm';
import { format } from 'date-fns';
import styles from './TaskList.module.css';
import { AutoScheduleButton } from './AutoScheduleButton';
import StudySchedulerModal from './StudySchedulerModal';

const TaskList: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'overdue' | 'completed'>('all');
  const [showScheduler, setShowScheduler] = useState(false);
  
  const { tasks, deleteTask, updateTask } = useScheduleStore();
 
  console.log('TaskList rendered, tasks:', tasks);
  console.log('Tasks length:', tasks.length);
 
  const filteredTasks = tasks.filter(task => {
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    
    switch (filter) {
      case 'upcoming':
        return dueDate > now && task.status !== 'completed';
      case 'overdue':
        return dueDate < now && task.status !== 'completed';
      case 'completed':
        return task.status === 'completed';
      default:
        return true;
    }
  });
  
  const handleComplete = (taskId: string) => {
    updateTask(taskId, { status: 'completed' });
  };
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>All Tasks</h2>
        <button onClick={() => setShowForm(true)} className={styles.addButton}>
          + New Task
        </button>
      </div>
      
      <div className={styles.filters}>
        <button 
          className={filter === 'all' ? styles.active : ''}
          onClick={() => setFilter('all')}
        >
          All ({tasks.length})
        </button>
        <button 
          className={filter === 'upcoming' ? styles.active : ''}
          onClick={() => setFilter('upcoming')}
        >
          Upcoming
        </button>
        <button 
          className={filter === 'overdue' ? styles.active : ''}
          onClick={() => setFilter('overdue')}
        >
          Overdue
        </button>
        <button 
          className={filter === 'completed' ? styles.active : ''}
          onClick={() => setFilter('completed')}
        >
          Completed
        </button>
      </div>
      
      <AutoScheduleButton />
      
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <button 
          onClick={() => setShowScheduler(true)}
          className={styles.addButton}
          style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '0.75rem 1.5rem'
          }}
        >
          🧠 Smart Study Scheduler
        </button>
      </div>

      <div className={styles.taskList}>
        {filteredTasks.map(task => (
          <div key={task.id} className={styles.taskItem}>
            <div className={styles.taskMain}>
              <input
                type="checkbox"
                checked={task.status === 'completed'}
                onChange={() => handleComplete(task.id)}
                className={styles.checkbox}
              />
              
              <div className={styles.taskInfo}>
                <h3 className={task.status === 'completed' ? styles.completed : ''}>
                  {task.title}
                </h3>
                <div className={styles.taskMeta}>
                  <span className={styles.type}>{task.type}</span>
                  <span className={styles.complexity}>
                    {'★'.repeat(task.complexity)}
                  </span>
                  <span className={styles.due}>
                    Due {format(new Date(task.dueDate), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
            </div>
            
            <div className={styles.taskActions}>
              <button onClick={() => setEditingTask(task.id)}>Edit</button>
              <button onClick={() => deleteTask(task.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
      
      {showForm && (
        <TaskForm 
          onClose={() => setShowForm(false)}
          taskId={editingTask}
        />
      )}
      
      <StudySchedulerModal 
        isOpen={showScheduler}
        onClose={() => setShowScheduler(false)}
      />
    </div>
  );
};

export default TaskList;
