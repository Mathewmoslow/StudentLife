// Quick fix: Update src/components/tasks/TaskList.tsx to force styling
import React, { useState } from 'react';
import { useScheduleStore } from '../../stores/useScheduleStore';
import TaskForm from './TaskForm';
import { format } from 'date-fns';
import { AutoScheduleButton } from './AutoScheduleButton';

const TaskList: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'overdue' | 'completed'>('all');
  
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
  
  // Inline styles for immediate fix
  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto'
  };
  
  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem'
  };
  
  const titleStyle = {
    color: '#f9fafb',
    fontSize: '2rem',
    fontWeight: '600'
  };
  
  const buttonStyle = {
    background: '#6366f1',
    color: 'white',
    padding: '12px 24px',
    fontWeight: '600',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer'
  };
  
  const filtersStyle = {
    display: 'flex',
    gap: '8px',
    marginBottom: '2rem',
    background: '#1f2937',
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid #374151'
  };
  
  const filterButtonStyle = (isActive: boolean) => ({
    background: isActive ? '#6366f1' : 'transparent',
    color: isActive ? 'white' : '#d1d5db',
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '500'
  });
  
  const taskItemStyle = {
    background: '#1f2937',
    border: '1px solid #374151',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };
  
  const taskMainStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flex: 1
  };
  
  const taskInfoStyle = {
    flex: 1
  };
  
  const taskTitleStyle = (completed: boolean) => ({
    fontSize: '18px',
    marginBottom: '8px',
    color: '#f9fafb',
    fontWeight: '600',
    textDecoration: completed ? 'line-through' : 'none',
    opacity: completed ? 0.7 : 1
  });
  
  const taskMetaStyle = {
    display: 'flex',
    gap: '16px',
    fontSize: '14px',
    color: '#d1d5db',
    alignItems: 'center'
  };
  
  const typeStyle = {
    background: '#374151',
    padding: '2px 8px',
    borderRadius: '4px',
    fontWeight: '500',
    textTransform: 'capitalize' as const
  };
  
  const actionButtonStyle = {
    background: '#111827',
    color: '#f9fafb',
    padding: '6px 12px',
    fontSize: '14px',
    border: '1px solid #374151',
    borderRadius: '6px',
    cursor: 'pointer',
    marginLeft: '8px'
  };
  
  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h2 style={titleStyle}>All Tasks</h2>
        <button onClick={() => setShowForm(true)} style={buttonStyle}>
          + New Task
        </button>
      </div>
      
      <div style={filtersStyle}>
        <button 
          style={filterButtonStyle(filter === 'all')}
          onClick={() => setFilter('all')}
        >
          All ({tasks.length})
        </button>
        <button 
          style={filterButtonStyle(filter === 'upcoming')}
          onClick={() => setFilter('upcoming')}
        >
          Upcoming
        </button>
        <button 
          style={filterButtonStyle(filter === 'overdue')}
          onClick={() => setFilter('overdue')}
        >
          Overdue
        </button>
        <button 
          style={filterButtonStyle(filter === 'completed')}
          onClick={() => setFilter('completed')}
        >
          Completed
        </button>
      </div>
      
      <AutoScheduleButton />

      <div>
        {filteredTasks.map(task => (
          <div key={task.id} style={taskItemStyle}>
            <div style={taskMainStyle}>
              <input
                type="checkbox"
                checked={task.status === 'completed'}
                onChange={() => handleComplete(task.id)}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
              
              <div style={taskInfoStyle}>
                <h3 style={taskTitleStyle(task.status === 'completed')}>
                  {task.title}
                </h3>
                <div style={taskMetaStyle}>
                  <span style={typeStyle}>{task.type}</span>
                  <span style={{ color: '#f59e0b', fontWeight: '600' }}>
                    {'★'.repeat(task.complexity)}
                  </span>
                  <span style={{ color: '#9ca3af' }}>
                    Due {format(new Date(task.dueDate), 'MMM d, yyyy')}
                  </span>
                  <span style={{ color: '#10b981', fontWeight: '600' }}>
                    {task.estimatedHours}h
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <button onClick={() => setEditingTask(task.id)} style={actionButtonStyle}>
                Edit
              </button>
              <button onClick={() => deleteTask(task.id)} style={actionButtonStyle}>
                Delete
              </button>
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
    </div>
  );
};

export default TaskList;