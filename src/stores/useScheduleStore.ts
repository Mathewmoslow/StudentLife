import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Course, Task, TimeBlock, Event, UserPreferences, CreateTaskData } from '../types';
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
  addTask: (task: CreateTaskData) => void;
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
}

const defaultPreferences: UserPreferences = {
  // Study session settings
  studySessionDuration: 120, // 2 hours
  breakDuration: 15,
  maxDailyStudyHours: 8,
  hoursPerWorkDay: 2, // Default 2 hours per day for task scheduling
  
  // Time preferences
  preferredStudyTimes: {
    morning: false,
    afternoon: true,
    evening: true,
    night: false,
  },
  
  // Buffer days by task type
  daysBeforeExam: 7,
  daysBeforeAssignment: 3,
  daysBeforeProject: 10,
  daysBeforeReading: 2,
  daysBeforeLab: 3,
  
  // Default hours by task type
  defaultHoursPerType: {
    assignment: 3,
    exam: 10,      // Study hours for exam prep
    project: 15,
    reading: 2,
    lab: 4,
  },
  
  // Complexity multipliers
  complexityMultipliers: {
    1: 0.5,   // Very easy = 50% of base hours
    2: 0.75,  // Easy = 75%
    3: 1.0,   // Medium = 100%
    4: 1.5,   // Hard = 150%
    5: 2.0,   // Very hard = 200%
  },
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
        
        // Get buffer days based on task type and user preferences (auto-calculate if not provided)
        const getBufferDays = (type: Task['type'], providedBufferDays?: number): number => {
          if (providedBufferDays !== undefined) {
            return providedBufferDays;
          }
          
          // Ensure preferences exist with fallbacks
          const preferences = state.preferences || defaultPreferences;
          
          switch (type) {
            case 'exam': return preferences.daysBeforeExam || 7;
            case 'assignment': return preferences.daysBeforeAssignment || 3;
            case 'project': return preferences.daysBeforeProject || 10;
            case 'reading': return preferences.daysBeforeReading || 2;
            case 'lab': return preferences.daysBeforeLab || 3;
            default: return 3;
          }
        };
        
        // Calculate estimated hours if not provided
        const getEstimatedHours = (): number => {
          if (taskData.estimatedHours && taskData.estimatedHours > 0) {
            return taskData.estimatedHours;
          }
          
          // Ensure preferences exist with fallbacks
          const defaultHours = state.preferences?.defaultHoursPerType || {
            assignment: 3,
            exam: 10,
            project: 15,
            reading: 2,
            lab: 4,
          };
          
          const complexityMultipliers = state.preferences?.complexityMultipliers || {
            1: 0.5,
            2: 0.75,
            3: 1.0,
            4: 1.5,
            5: 2.0,
          };
          
          const baseHours = defaultHours[taskData.type];
          const multiplier = complexityMultipliers[taskData.complexity];
          
          return baseHours * multiplier;
        };
        
        // Create the task
        const newTask: Task = {
          ...taskData,
          id: taskId,
          bufferDays: getBufferDays(taskData.type, taskData.bufferDays),
          estimatedHours: getEstimatedHours(),
          scheduledBlocks: [],
          isHardDeadline: taskData.isHardDeadline ?? false,
        };
        
        console.log(`Creating task: ${newTask.title}, estimated hours: ${newTask.estimatedHours}, buffer days: ${newTask.bufferDays}`);
        
        set((state) => ({
          tasks: [...state.tasks, newTask],
        }));
        
        // Create a deadline event (visual representation of DUE date)
        const course = state.courses.find(c => c.id === taskData.courseId);
        const deadlineEvent: Event = {
          id: uuidv4(),
          title: `DUE: ${taskData.title}`,
          type: 'deadline',
          courseId: taskData.courseId,
          startTime: taskData.dueDate,
          endTime: new Date(taskData.dueDate.getTime() + 30 * 60 * 1000), // 30 min block for visibility
          description: `Deadline for ${taskData.title}`,
          taskId: taskId,
        };
        
        set((state) => ({
          events: [...state.events, deadlineEvent],
        }));
        
        // Schedule DO blocks for the task (work time before deadline)
        if (newTask.estimatedHours > 0) {
          get().scheduleTask(taskId);
        }
      },
      
      updateTask: (id, taskUpdates) => {
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...taskUpdates } : t)),
        }));
        
        // If significant changes, reschedule
        if (taskUpdates.estimatedHours || taskUpdates.dueDate || taskUpdates.complexity) {
          // Clear existing blocks for this task
          set((state) => ({
            timeBlocks: state.timeBlocks.filter((tb) => tb.taskId !== id || tb.isManual),
          }));
          
          // Reschedule
          setTimeout(() => get().scheduleTask(id), 100);
        }
      },
      
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
        if (!task || task.estimatedHours === 0) {
          console.log(`Skipping scheduling for task ${taskId} - no estimated hours`);
          return;
        }
        
        // Ensure bufferDays is set (fallback to default if somehow undefined)
        const bufferDays = task.bufferDays ?? (() => {
          const preferences = state.preferences || defaultPreferences;
          switch (task.type) {
            case 'exam': return preferences.daysBeforeExam || 7;
            case 'assignment': return preferences.daysBeforeAssignment || 3;
            case 'project': return preferences.daysBeforeProject || 10;
            case 'reading': return preferences.daysBeforeReading || 2;
            case 'lab': return preferences.daysBeforeLab || 3;
            default: return 3;
          }
        })();
        
        console.log(`Scheduling task: ${task.title}, estimated hours: ${task.estimatedHours}, buffer days: ${bufferDays}`);
        
        // Calculate soft deadline (when work should be completed)
        const softDeadline = subDays(task.dueDate, bufferDays);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Calculate start date based on user's preferred hours per work day
        const preferences = state.preferences || defaultPreferences;
        const daysNeeded = Math.ceil(task.estimatedHours / (preferences.hoursPerWorkDay || 2));
        const idealStartDate = subDays(softDeadline, daysNeeded);
        const startDate = isAfter(today, idealStartDate) ? today : idealStartDate;
        
        // Calculate how many days we have to work
        const daysAvailable = Math.max(1, differenceInDays(softDeadline, startDate));
        const hoursPerDay = Math.min(
          task.estimatedHours / daysAvailable, 
          preferences.maxDailyStudyHours || 8
        );
        
        console.log(`Days needed: ${daysNeeded}, days available: ${daysAvailable}, hours per day: ${hoursPerDay}`);
        
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
          const studyTimes = preferences.preferredStudyTimes || defaultPreferences.preferredStudyTimes;
          
          if (studyTimes.morning && !dayEvents.length) {
            startHour = 9;
          } else if (studyTimes.evening) {
            startHour = 18;
          } else if (studyTimes.night) {
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
                  task.type === 'exam' ? 'review' : 'work',
            isManual: false
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
        
        // Clear existing auto-scheduled time blocks (keep manual ones)
        set((prevState) => ({
          timeBlocks: prevState.timeBlocks.filter(tb => tb.isManual === true)
        }));
        
        // Reschedule all incomplete tasks
        state.tasks
          .filter(task => task.status !== 'completed' && task.estimatedHours > 0)
          .forEach(task => {
            console.log(`Rescheduling task: ${task.title}`);
            get().scheduleTask(task.id);
          });
      },
      
      updatePreferences: (newPreferences) => {
        set((state) => ({
          preferences: { 
            ...(state.preferences || defaultPreferences), 
            ...newPreferences 
          },
        }));
        
        // If scheduling-related preferences changed, reschedule all tasks
        const schedulingKeys = [
          'hoursPerWorkDay', 'maxDailyStudyHours', 'preferredStudyTimes',
          'daysBeforeExam', 'daysBeforeAssignment', 'daysBeforeProject', 
          'daysBeforeReading', 'daysBeforeLab', 'defaultHoursPerType', 'complexityMultipliers'
        ];
        
        const hasSchedulingChanges = schedulingKeys.some(key => key in newPreferences);
        
        if (hasSchedulingChanges) {
          console.log('Scheduling preferences changed, rescheduling all tasks...');
          setTimeout(() => get().rescheduleAllTasks(), 100);
        }
      },
    }),
    {
      name: 'schedule-store',
      // Ensure preferences are always complete
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Merge with default preferences to ensure all properties exist
          state.preferences = {
            ...defaultPreferences,
            ...state.preferences
          };
        }
      }
    }
  )
);