import React from 'react';
import { useScheduleStore } from '../../stores/useScheduleStore';
import { format } from 'date-fns';
import TaskCard from '../common/TaskCard';
import QuickAdd from '../common/QuickAdd';
import StatsCard from '../common/StatsCard';
import styles from './Dashboard.module.css';

// Add this to your Dashboard or anywhere to debug scheduling issues
export const DebugScheduling: React.FC = () => {
  const { tasks, timeBlocks, courses, events } = useScheduleStore();
  
  const debugInfo = {
    totalTasks: tasks.length,
    tasksWithHours: tasks.filter(t => t.estimatedHours > 0).length,
    incompleteTasks: tasks.filter(t => t.status !== 'completed').length,
    incompleteTasksWithHours: tasks.filter(t => t.status !== 'completed' && t.estimatedHours > 0).length,
    totalTimeBlocks: timeBlocks.length,
    totalCourses: courses.length,
    totalEvents: events.length,
    taskDetails: tasks.slice(0, 10).map(t => ({
      title: t.title.substring(0, 30),
      estimatedHours: t.estimatedHours,
      status: t.status,
      type: t.type,
      dueDate: new Date(t.dueDate).toLocaleDateString(),
      blocksCount: timeBlocks.filter(b => b.taskId === t.id).length
    }))
  };
  
  console.log('📊 Full Scheduling Debug Info:', debugInfo);
  console.log('📊 All tasks:', tasks.map(t => ({
    title: t.title.substring(0, 20),
    hours: t.estimatedHours,
    status: t.status,
    type: t.type
  })));
  
  return (
    <div style={{ 
      position: 'fixed', 
      top: 10, 
      right: 10, 
      background: '#f0f0f0', 
      padding: '10px', 
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 1000,
      maxWidth: '400px',
      maxHeight: '500px',
      overflow: 'auto'
    }}>
      <h4>🐛 Debug Info</h4>
      <p><strong>Tasks:</strong> {debugInfo.totalTasks}</p>
      <p><strong>Tasks with hours:</strong> {debugInfo.tasksWithHours}</p>
      <p><strong>Incomplete tasks:</strong> {debugInfo.incompleteTasks}</p>
      <p><strong>Incomplete + hours:</strong> {debugInfo.incompleteTasksWithHours}</p>
      <p><strong>Time blocks:</strong> {debugInfo.totalTimeBlocks}</p>
      <p><strong>Courses:</strong> {debugInfo.totalCourses}</p>
      <p><strong>Events:</strong> {debugInfo.totalEvents}</p>
      
      <details>
        <summary>📋 First 10 Tasks</summary>
        {debugInfo.taskDetails.map((task, i) => (
          <div key={i} style={{ fontSize: '10px', margin: '4px 0', padding: '2px', backgroundColor: '#e0e0e0' }}>
            <strong>{task.title}...</strong><br/>
            <span style={{ color: task.estimatedHours > 0 ? 'green' : 'red' }}>
              Hours: {task.estimatedHours}
            </span> | 
            Blocks: {task.blocksCount} | 
            Status: {task.status}<br/>
            Type: {task.type} | Due: {task.dueDate}
          </div>
        ))}
      </details>
      
      <button 
        onClick={() => {
          const store = useScheduleStore.getState();
          console.log('🔄 Manual reschedule triggered');
          store.rescheduleAllTasks();
        }}
        style={{ 
          marginTop: '10px', 
          padding: '5px 10px', 
          backgroundColor: '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '3px',
          cursor: 'pointer'
        }}
      >
        🔄 Manual Reschedule
      </button>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { tasks } = useScheduleStore();
  
  // Get current tasks (safer approach without potentially missing store methods)
  const now = new Date();
  
  const todaysTasks = tasks.filter(task => {
    if (task.status === 'completed') return false;
    const taskDate = new Date(task.dueDate);
    return taskDate.toDateString() === now.toDateString();
  });
  
  const upcomingTasks = tasks.filter(task => {
    if (task.status === 'completed') return false;
    const taskDate = new Date(task.dueDate);
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(now.getDate() + 7);
    return taskDate > now && taskDate <= oneWeekFromNow;
  });
  
  const overdueTasks = tasks.filter(task => {
    const taskDate = new Date(task.dueDate);
    return taskDate < now && task.status !== 'completed';
  });
  
  const stats = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === 'completed').length,
    upcomingExams: tasks.filter(t => t.type === 'exam' && t.status !== 'completed').length,
    hoursScheduled: tasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0)
  };
  
  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1>Welcome back!</h1>
        <p>{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </header>
      
      <QuickAdd />
      
      <div className={styles.statsGrid}>
        <StatsCard title="Total Tasks" value={stats.totalTasks} icon="📚" />
        <StatsCard title="Completed" value={stats.completedTasks} icon="✅" />
        <StatsCard title="Upcoming Exams" value={stats.upcomingExams} icon="📝" />
        <StatsCard title="Hours Scheduled" value={Math.round(stats.hoursScheduled)} icon="⏰" />
      </div>
      
      <div className={styles.content}>
        <section className={styles.section}>
          <h2>Today's Focus</h2>
          {todaysTasks.length === 0 ? (
            <p className={styles.emptyState}>No tasks scheduled for today</p>
          ) : (
            <div className={styles.taskGrid}>
              {todaysTasks.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </section>
        
        {overdueTasks.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.overdueTitle}>⚠️ Overdue Tasks ({overdueTasks.length})</h2>
            <div className={styles.taskGrid}>
              {overdueTasks.slice(0, 6).map(task => (
                <TaskCard key={task.id} task={task} isOverdue />
              ))}
            </div>
            {overdueTasks.length > 6 && (
              <p style={{ textAlign: 'center', marginTop: '16px', color: '#6b7280' }}>
                ... and {overdueTasks.length - 6} more overdue tasks
              </p>
            )}
          </section>
        )}
        
        <section className={styles.section}>
          <h2>This Week</h2>
          <div className={styles.taskGrid}>
            {upcomingTasks.slice(0, 6).map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </section>
      </div>
      
      {/* Add the debug component */}
      <DebugScheduling />
    </div>
  );
};

export default Dashboard;