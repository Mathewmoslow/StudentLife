// First, let's check what's in the browser console and fix the store issue
// Update src/stores/useScheduleStore.ts to fix the auto-scheduling

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { addDays, subDays, isSameDay, startOfDay } from 'date-fns';

// Define interfaces inline to avoid import issues
interface Course {
  id: string;
  name: string;
  code: string;
  professor: string;
  color: string;
  credits: number;
  schedule: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    type: 'lecture' | 'lab' | 'tutorial' | 'office-hours';
  }>;
}

interface Task {
  id: string;
  title: string;
  type: 'assignment' | 'exam' | 'project' | 'reading' | 'lab';
  courseId: string;
  dueDate: Date;
  complexity: 1 | 2 | 3 | 4 | 5;
  estimatedHours: number;
  isHardDeadline: boolean;
  bufferDays?: number;
  bufferPercentage?: number;
  status: 'not-started' | 'in-progress' | 'completed';
  description?: string;
  scheduledBlocks: TimeBlock[];
}

interface TimeBlock {
  id: string;
  taskId: string;
  startTime: Date;
  endTime: Date;
  completed: boolean;
  type?: string;
  isManual?: boolean;
}

interface Event {
  id: string;
  title: string;
  type: 'lecture' | 'clinical' | 'lab' | 'exam' | 'simulation' | 'review' | 'deadline';
  courseId: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  description?: string;
  taskId?: string;
}

interface UserPreferences {
  studySessionDuration: number;
  breakDuration: number;
  maxDailyStudyHours: number;
  preferredStudyTimes: {
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
    night: boolean;
  };
  daysBeforeExam: number;
  daysBeforeAssignment: number;
  daysBeforeProject: number;
}

interface ScheduleStore {
  courses: Course[];
  tasks: Task[];
  timeBlocks: TimeBlock[];
  events: Event[];
  preferences: UserPreferences;
  
  // Actions
  addCourse: (course: Omit<Course, 'id'>) => void;
  updateCourse: (id: string, course: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  
  addTimeBlock: (timeBlock: Omit<TimeBlock, 'id'>) => void;
  updateTimeBlock: (id: string, timeBlock: Partial<TimeBlock>) => void;
  deleteTimeBlock: (id: string) => void;
  
  addEvent: (event: Omit<Event, 'id'>) => void;
  updateEvent: (id: string, event: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  
  scheduleTask: (taskId: string) => void;
  rescheduleAllTasks: () => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  
  // Helper methods
  getTasksForDate: (date: Date) => Task[];
  getUpcomingTasks: (days: number) => Task[];
  getTasksByCourse: (courseId: string) => Task[];
}

const defaultPreferences: UserPreferences = {
  studySessionDuration: 120,
  breakDuration: 15,
  maxDailyStudyHours: 8,
  preferredStudyTimes: {
    morning: false,
    afternoon: true,
    evening: true,
    night: false,
  },
  daysBeforeExam: 7,
  daysBeforeAssignment: 3,
  daysBeforeProject: 10,
};

export const useScheduleStore = create<ScheduleStore>()(
  persist(
    (set, get) => ({
      courses: [],
      tasks: [],
      timeBlocks: [],
      events: [],
      preferences: defaultPreferences,
      
      addCourse: (course) => set((state) => ({
        courses: [...state.courses, { ...course, id: uuidv4() }],
      })),
      
      updateCourse: (id, course) => set((state) => ({
        courses: state.courses.map((c) => (c.id === id ? { ...c, ...course } : c)),
      })),
      
      deleteCourse: (id) => set((state) => ({
        courses: state.courses.filter((c) => c.id !== id),
        tasks: state.tasks.filter((t) => t.courseId !== id),
        events: state.events.filter((e) => e.courseId !== id),
      })),
      
      addTask: (taskData) => {
        const taskId = uuidv4();
        const state = get();
        
        // Set buffer days based on task type
        let bufferDays = 3;
        if (taskData.type === 'exam') {
          bufferDays = state.preferences.daysBeforeExam;
        } else if (taskData.type === 'assignment') {
          bufferDays = state.preferences.daysBeforeAssignment;
        } else if (taskData.type === 'project') {
          bufferDays = state.preferences.daysBeforeProject;
        }
        
        // Estimate hours if not provided
        let estimatedHours = taskData.estimatedHours;
        if (!estimatedHours || estimatedHours === 0) {
          const hoursByType = {
            assignment: 3,
            exam: 10,
            project: 15,
            reading: 2,
            lab: 4
          };
          estimatedHours = hoursByType[taskData.type] || 3;
        }
        
        const newTask: Task = {
          ...taskData,
          id: taskId,
          bufferDays,
          estimatedHours,
          scheduledBlocks: []
        };
        
        set((state) => ({
          tasks: [...state.tasks, newTask],
        }));
        
        // Create deadline event
        const deadlineEvent: Omit<Event, 'id'> = {
          title: `DUE: ${taskData.title}`,
          type: 'deadline',
          courseId: taskData.courseId,
          startTime: taskData.dueDate,
          endTime: new Date(taskData.dueDate.getTime() + 30 * 60 * 1000),
          description: `Deadline for ${taskData.title}`,
          taskId: taskId,
        };
        
        get().addEvent(deadlineEvent);
        
        // Schedule the task immediately
        setTimeout(() => {
          console.log('Auto-scheduling task:', newTask.title);
          get().scheduleTask(taskId);
        }, 100);
      },
      
      updateTask: (id, task) => set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...task } : t)),
      })),
      
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
        timeBlocks: state.timeBlocks.filter((tb) => tb.taskId !== id),
        events: state.events.filter((e) => e.taskId !== id),
      })),
      
      addTimeBlock: (timeBlock) => set((state) => ({
        timeBlocks: [...state.timeBlocks, { ...timeBlock, id: uuidv4() }],
      })),
      
      updateTimeBlock: (id, timeBlock) => set((state) => ({
        timeBlocks: state.timeBlocks.map((tb) => (tb.id === id ? { ...tb, ...timeBlock } : tb)),
      })),
      
      deleteTimeBlock: (id) => set((state) => ({
        timeBlocks: state.timeBlocks.filter((tb) => tb.id !== id),
      })),
      
      addEvent: (event) => set((state) => ({
        events: [...state.events, { ...event, id: uuidv4() }],
      })),
      
      updateEvent: (id, event) => set((state) => ({
        events: state.events.map((e) => (e.id === id ? { ...e, ...event } : e)),
      })),
      
      deleteEvent: (id) => set((state) => ({
        events: state.events.filter((e) => e.id !== id),
      })),
      
      scheduleTask: (taskId) => {
        const state = get();
        const task = state.tasks.find(t => t.id === taskId);
        
        if (!task || task.estimatedHours === 0) {
          console.log('Task not found or no hours estimated:', taskId);
          return;
        }
        
        console.log(`Creating study blocks for: ${task.title} (${task.estimatedHours}h)`);
        
        // Clear existing blocks for this task
        set((state) => ({
          timeBlocks: state.timeBlocks.filter(tb => tb.taskId !== taskId)
        }));
        
        // Calculate when to start working
        const dueDate = new Date(task.dueDate);
        const bufferDays = task.bufferDays || 3;
        const startDate = subDays(dueDate, bufferDays + Math.ceil(task.estimatedHours / 2));
        
        // Create study blocks
        const blocks: TimeBlock[] = [];
        let remainingHours = task.estimatedHours;
        let currentDate = new Date(Math.max(startDate.getTime(), Date.now()));
        
        while (remainingHours > 0 && currentDate < dueDate) {
          // Check if this day has conflicts (clinical days, etc.)
          const dayEvents = state.events.filter(e => 
            isSameDay(e.startTime, currentDate) && 
            e.type === 'clinical'
          );
          
          if (dayEvents.length === 0) {
            // Schedule 2-hour study block
            const blockHours = Math.min(remainingHours, 2);
            const startHour = state.preferences.preferredStudyTimes.morning ? 9 : 14;
            
            const blockStart = new Date(currentDate);
            blockStart.setHours(startHour, 0, 0, 0);
            
            const blockEnd = new Date(blockStart);
            blockEnd.setHours(startHour + blockHours, 0, 0, 0);
            
            blocks.push({
              id: uuidv4(),
              taskId: task.id,
              startTime: blockStart,
              endTime: blockEnd,
              completed: false,
              type: 'study',
              isManual: false
            });
            
            remainingHours -= blockHours;
            console.log(`Created study block: ${blockHours}h on ${currentDate.toDateString()}`);
          }
          
          currentDate = addDays(currentDate, 1);
        }
        
        // Add all blocks to store
        set((state) => ({
          timeBlocks: [...state.timeBlocks, ...blocks]
        }));
        
        console.log(`Created ${blocks.length} study blocks for ${task.title}`);
      },
      
      rescheduleAllTasks: () => {
        const state = get();
        console.log('Rescheduling all tasks...');
        
        // Clear all auto-generated blocks
        set((state) => ({
          timeBlocks: state.timeBlocks.filter(tb => tb.isManual === true)
        }));
        
        // Reschedule each incomplete task
        state.tasks
          .filter(task => task.status !== 'completed' && task.estimatedHours > 0)
          .forEach(task => {
            console.log(`Rescheduling: ${task.title}`);
            get().scheduleTask(task.id);
          });
      },
      
      updatePreferences: (preferences) => set((state) => ({
        preferences: { ...state.preferences, ...preferences },
      })),
      
      // Helper methods
      getTasksForDate: (date) => {
        const { tasks } = get();
        return tasks.filter(task => isSameDay(new Date(task.dueDate), date));
      },
      
      getUpcomingTasks: (days) => {
        const { tasks } = get();
        const now = new Date();
        const futureDate = addDays(now, days);
        
        return tasks.filter(task => {
          const taskDate = new Date(task.dueDate);
          return taskDate >= now && taskDate <= futureDate;
        });
      },
      
      getTasksByCourse: (courseId) => {
        const { tasks } = get();
        return tasks.filter(task => task.courseId === courseId);
      },
    }),
    {
      name: 'schedule-store',
    }
  )
);