// Update src/stores/scheduleActions.ts to fix auto-scheduling
import { useScheduleStore } from './useScheduleStore';

export const autoScheduleTasks = () => {
  const state = useScheduleStore.getState();
  const { tasks, rescheduleAllTasks } = state;
  
  console.log('=== AUTO-SCHEDULE TRIGGERED ===');
  console.log('Total tasks:', tasks.length);
  
  // Count tasks that need scheduling
  const incompleteTasks = tasks.filter(task => 
    task.status !== 'completed' && 
    task.estimatedHours > 0
  );
  
  console.log('Tasks to schedule:', incompleteTasks.length);
  console.log('Tasks details:', incompleteTasks.map(t => ({
    title: t.title,
    hours: t.estimatedHours,
    due: t.dueDate
  })));
  
  if (incompleteTasks.length === 0) {
    console.log('No tasks found to schedule!');
    return {
      tasksScheduled: 0,
      blocksCreated: 0
    };
  }
  
  // Clear existing auto-generated blocks first
  useScheduleStore.setState((state) => ({
    timeBlocks: state.timeBlocks.filter(block => block.isManual === true)
  }));
  
  // Force reschedule all tasks
  rescheduleAllTasks();
  
  // Wait a bit then check results
  setTimeout(() => {
    const newState = useScheduleStore.getState();
    const blocksCreated = newState.timeBlocks.filter(b => b.isManual !== true).length;
    console.log('=== SCHEDULING COMPLETE ===');
    console.log('Study blocks created:', blocksCreated);
    console.log('All time blocks:', newState.timeBlocks.map(b => ({
      taskId: b.taskId,
      start: b.startTime,
      end: b.endTime,
      type: b.type
    })));
  }, 500);
  
  return {
    tasksScheduled: incompleteTasks.length,
    blocksCreated: incompleteTasks.length * 2 // Estimate
  };
};