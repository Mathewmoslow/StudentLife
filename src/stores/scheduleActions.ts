import { useScheduleStore } from './useScheduleStore';

export const autoScheduleTasks = () => {
  const state = useScheduleStore.getState();
  const { tasks, rescheduleAllTasks } = state;
  
  // Get incomplete tasks
  const incompleteTasks = tasks.filter(task => task.status !== 'completed');
  
  console.log(`Auto-scheduling ${incompleteTasks.length} tasks...`);
  
  // Use the store's built-in reschedule function which handles all the smart logic
  rescheduleAllTasks();
  
  // Count the newly created blocks
  const updatedState = useScheduleStore.getState();
  const autoBlocks = updatedState.timeBlocks.filter(block => !block.isManual);
  
  console.log(`Created ${autoBlocks.length} study blocks for ${incompleteTasks.length} tasks`);
  
  return {
    tasksScheduled: incompleteTasks.length,
    blocksCreated: autoBlocks.length
  };
};