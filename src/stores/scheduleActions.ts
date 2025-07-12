import { useScheduleStore } from './useScheduleStore';
import { TaskScheduler } from '../core/algorithms/scheduler';

export const autoScheduleTasks = () => {
  const state = useScheduleStore.getState();
  const { tasks, courses, events, preferences, timeBlocks, updateTask } = state;
  
  // Clear existing auto-scheduled blocks (keep manually created ones)
  const manualBlocks = timeBlocks.filter(block => block.isManual);
  
  // Create scheduler instance
  const scheduler = new TaskScheduler(
    preferences,
    courses,
    events,
    manualBlocks
  );
  
  // Schedule all incomplete tasks
  const incompleteTasks = tasks.filter(task => task.status !== 'completed');
  const scheduledBlocks = scheduler.scheduleAllTasks(incompleteTasks);
  
  // Update store with new blocks
  const allNewBlocks: any[] = [];
  scheduledBlocks.forEach((blocks, taskId) => {
    allNewBlocks.push(...blocks);
    
    // Use the updateTask method instead of direct mutation
    updateTask(taskId, { scheduledBlocks: blocks });
  });
  
  // Update timeBlocks in store
  useScheduleStore.setState({
    timeBlocks: [...manualBlocks, ...allNewBlocks]
  });
  
  console.log(`Auto-scheduled ${allNewBlocks.length} study blocks for ${incompleteTasks.length} tasks`);
  
  return {
    tasksScheduled: incompleteTasks.length,
    blocksCreated: allNewBlocks.length
  };
};
