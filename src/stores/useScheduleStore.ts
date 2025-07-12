import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Course, Task, TimeBlock, Event, UserPreferences } from '../types';
import { addDays, startOfDay, endOfDay, isBefore, isAfter, differenceInDays, subDays, isSameDay } from 'date-fns';

interface ScheduleStore {
  courses: Course[];
  tasks: Task[];
  timeBlocks: TimeBlock[];
  events: Event[];
  preferences: UserPreferences;
  
  // Course actions
  addCourse: (course: Omit<Course, 'id'>) => void;
  updateCourse: (id: string, course: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  
  // Task actions
  addTask: (task: Omit<Task, 'id' | 'scheduledBlocks'>) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  
  // TimeBlock actions
  addTimeBlock: (timeBlock: Omit<TimeBlock, 'id'>) => void;
  updateTimeBlock: (id: string, timeBlock: Partial<TimeBlock>) => void;
  deleteTimeBlock: (id: string) => void;
  
  // Event actions
  addEvent: (event: Omit<Event, 'id'>) => void;
  updateEvent: (id: string, event: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  
  // Scheduling actions
  scheduleTask: (taskId: string) => void;
  rescheduleAllTasks: () => void;
  
  // Preferences
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  
  // Queries
  getTasksForDate: (date: Date) => Task[];
  getUpcomingTasks: (days: number) => Task[];
  getTasksByCourse: (courseId: string) => Task[];
}

const defaultPreferences: UserPreferences = {
  studyHours: { start: '09:00', end: '22:00' },
  breakDuration: 15,
  sessionDuration: 120,
  complexityDefaults: {
    assignment: 3,
    exam: 5,
    project: 4,
    reading: 2,
    lab: 3
  },
  bufferDefaults: {
    soft: 20,
    hard: 10
  },
  energyLevels: {
    9: 0.7, 10: 0.9, 11: 1.0, 12: 0.8, 13: 0.6,
    14: 0.7, 15: 0.8, 16: 0.9, 17: 0.8, 18: 0.7,
    19: 0.8, 20: 0.7, 21: 0.6, 22: 0.5
  },
  studySessionDuration: 120,
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
  hoursPerWorkDay: 3
};

export const useScheduleStore = create<ScheduleStore>()(
  persist(
    (set, get) => ({
      courses: [],
      tasks: [],
      timeBlocks: [],
      events: [],
      preferences: defaultPreferences,
      
      // Course actions
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
      
      // Task actions
      addTask: (taskData) => {
        const taskId = uuidv4();
        const state = get();
        
        // Determine buffer days based on task type and preferences
        let bufferDays = 3; // default
        if (taskData.type === 'exam') {
          bufferDays = state.preferences.daysBeforeExam || 7;
        } else if (taskData.type === 'assignment') {
          bufferDays = state.preferences.daysBeforeAssignment || 3;
        } else if (taskData.type === 'project') {
          bufferDays = state.preferences.daysBeforeProject || 10;
        } else if (taskData.type === 'reading') {
          bufferDays = 2; // Less buffer for readings
        }
        
        // Create the task with all required fields
        const newTask: Task = { 
          ...taskData, 
          id: taskId, 
          bufferDays,
          scheduledBlocks: [],
          bufferPercentage: taskData.bufferPercentage || 20
        };
        
        set((state) => ({
          tasks: [...state.tasks, newTask],
        }));
        
        // Create a deadline event (visual representation of DUE date)
        const deadlineEvent: Event = {
          id: uuidv4(),
          title: `DUE: ${taskData.title}`,
          type: 'deadline',
          courseId: taskData.courseId,
          startTime: taskData.dueDate,
          endTime: new Date(taskData.dueDate.getTime() + 30 * 60 * 1000), // 30 min block
          description: `Deadline for ${taskData.title}`,
          taskId: taskId,
        };
        
        set((state) => ({
          events: [...state.events, deadlineEvent],
        }));
        
        // Schedule DO blocks for the task (work time before deadline)
        if (taskData.estimatedHours && taskData.estimatedHours > 0) {
          get().scheduleTask(taskId);
        }
      },
      
      updateTask: (id, task) => set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...task } : t)),
      })),
      
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
        timeBlocks: state.timeBlocks.filter((tb) => tb.taskId !== id),
        events: state.events.filter((e) => e.taskId !== id),
      })),
      
      // TimeBlock actions
      addTimeBlock: (timeBlock) => set((state) => ({
        timeBlocks: [...state.timeBlocks, { ...timeBlock, id: uuidv4() }],
      })),
      
      updateTimeBlock: (id, timeBlock) => set((state) => ({
        timeBlocks: state.timeBlocks.map((tb) => (tb.id === id ? { ...tb, ...timeBlock } : tb)),
      })),
      
      deleteTimeBlock: (id) => set((state) => ({
        timeBlocks: state.timeBlocks.filter((tb) => tb.id !== id),
      })),
      
      // Event actions
      addEvent: (event) => {
        const state = get();
        
        // Check if this is an exam on a day that has lectures
        if (event.type === 'exam') {
          // Remove any lectures on the same day for the same course
          const examDate = startOfDay(event.startTime);
          const eventsToKeep = state.events.filter(e => {
            if (e.type === 'lecture' && e.courseId === event.courseId) {
              const eventDate = startOfDay(e.startTime);
              return !isSameDay(eventDate, examDate);
            }
            return true;
          });
          
          set({
            events: [...eventsToKeep, { ...event, id: uuidv4() }],
          });
        } else {
          set((state) => ({
            events: [...state.events, { ...event, id: uuidv4() }],
          }));
        }
      },
      
      updateEvent: (id, event) => set((state) => ({
        events: state.events.map((e) => (e.id === id ? { ...e, ...event } : e)),
      })),
      
      deleteEvent: (id) => set((state) => ({
        events: state.events.filter((e) => e.id !== id),
      })),
      
      // Scheduling
      scheduleTask: (taskId) => {
        const state = get();
        const task = state.tasks.find(t => t.id === taskId);
        if (!task || !task.estimatedHours || task.estimatedHours === 0) {
          console.log(`Skipping scheduling for task ${taskId} - no estimated hours`);
          return;
        }
        
        console.log(`Scheduling task: ${task.title}, estimated hours: ${task.estimatedHours}, buffer days: ${task.bufferDays}`);
        
        // Calculate soft deadline (when work should be completed)
        const softDeadline = subDays(task.dueDate, task.bufferDays || 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Start date is either today or some days before soft deadline
        const idealStartDate = subDays(softDeadline, Math.ceil(task.estimatedHours / 2)); // Start early enough
        const startDate = isAfter(today, idealStartDate) ? today : idealStartDate;
        
        // Calculate how many days we have to work
        const daysAvailable = Math.max(1, differenceInDays(softDeadline, startDate));
        const hoursPerDay = Math.min(
          task.estimatedHours / daysAvailable, 
          state.preferences.hoursPerWorkDay || 3 // Use preference or default to 3
        );
        
        console.log(`Days available: ${daysAvailable}, hours per day: ${hoursPerDay}`);
        
        // Create DO blocks (study/work time)
        let remainingHours = task.estimatedHours;
        let currentDate = new Date(startDate);
        const newBlocks: TimeBlock[] = [];
        
        while (remainingHours > 0 && isBefore(currentDate, softDeadline)) {
          // Check if there are any events on this day that would conflict
          const dayEvents = state.events.filter(e => 
            isSameDay(e.startTime, currentDate) && 
            (e.type === 'clinical' || e.type === 'exam' || e.type === 'lab')
          );
          
          // Skip days with all-day events
          if (dayEvents.some(e => e.type === 'clinical')) {
            currentDate = addDays(currentDate, 1);
            continue;
          }
          
          const hoursToday = Math.min(remainingHours, hoursPerDay);
          
          // Find best time slot based on preferences and conflicts
          let startHour = 14; // Default afternoon
          if (state.preferences.preferredStudyTimes?.morning && !dayEvents.length) {
            startHour = 9;
          } else if (state.preferences.preferredStudyTimes?.evening) {
            startHour = 18;
          } else if (state.preferences.preferredStudyTimes?.night) {
            startHour = 20;
          }
          
          const blockStart = new Date(currentDate);
          blockStart.setHours(startHour, 0, 0, 0);
          
          const blockEnd = new Date(blockStart);
          blockEnd.setHours(startHour + Math.ceil(hoursToday), 0, 0, 0);
          
          const newBlock: TimeBlock = {
            id: uuidv4(),
            taskId,
            startTime: blockStart,
            endTime: blockEnd,
            completed: false,
            type: task.type === 'reading' ? 'study' : 
                  task.type === 'exam' ? 'review' : 'work'
          };
          
          newBlocks.push(newBlock);
          
          remainingHours -= hoursToday;
          currentDate = addDays(currentDate, 1);
        }
        
        console.log(`Created ${newBlocks.length} DO blocks for task ${task.title}`);
        
        // Add all the new blocks
        set((state) => ({
          timeBlocks: [...state.timeBlocks, ...newBlocks]
        }));
      },
      
      rescheduleAllTasks: () => {
        const state = get();
        
        // Clear existing time blocks
        set({ timeBlocks: [] });
        
        // Reschedule all incomplete tasks
        state.tasks
          .filter(task => task.status !== 'completed' && task.estimatedHours > 0)
          .forEach(task => {
            console.log(`Rescheduling task: ${task.title}`);
            get().scheduleTask(task.id);
          });
      },
      
      updatePreferences: (preferences) => set((state) => ({
        preferences: { ...state.preferences, ...preferences },
      })),
      
      // Queries
      getTasksForDate: (date) => {
        const { tasks } = get();
        return tasks.filter(task => {
          const taskDate = new Date(task.dueDate);
          return taskDate.toDateString() === date.toDateString();
        });
      },
      
      getUpcomingTasks: (days) => {
        const { tasks } = get();
        const now = new Date();
        const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
        
        return tasks.filter(task => {
          const taskDate = new Date(task.dueDate);
          return taskDate >= now && taskDate <= futureDate;
        });
      },
      
      getTasksByCourse: (courseId) => {
        const { tasks } = get();
        return tasks.filter(task => task.courseId === courseId);
      }
    }),
    {
      name: 'schedule-store',
    }
  )
);
