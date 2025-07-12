import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Course, Task, TimeBlock, Event, UserPreferences } from '../types';
import { addDays, startOfDay, isAfter, differenceInDays, subDays, isSameDay, format } from 'date-fns';

// Extended Task interface with bufferDays
interface ExtendedTask extends Task {
  bufferDays?: number;
}

// Extended UserPreferences interface
interface ExtendedUserPreferences extends UserPreferences {
  studySessionDuration?: number;
  maxDailyStudyHours?: number;
  preferredStudyTimes?: {
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
    night: boolean;
  };
  daysBeforeExam?: number;
  daysBeforeAssignment?: number;
  daysBeforeProject?: number;
}

interface ScheduleStore {
  courses: Course[];
  tasks: ExtendedTask[];
  timeBlocks: TimeBlock[];
  events: Event[];
  preferences: ExtendedUserPreferences;
  
  // Course actions
  addCourse: (course: Omit<Course, 'id'>) => void;
  updateCourse: (id: string, course: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  
  // Task actions
  addTask: (task: Omit<Task, 'id'>) => void;
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
  
  // Helper methods
  createStudyBlocks: (task: ExtendedTask, startDate: Date, endDate: Date, totalHours: number) => TimeBlock[];
  getAvailableTimeSlots: (date: Date) => Array<{ start: Date; end: Date }>;
  getBusyTimesForDay: (date: Date) => Array<{ start: Date; end: Date }>;
  
  // Preferences
  updatePreferences: (preferences: Partial<ExtendedUserPreferences>) => void;
}

const defaultPreferences: ExtendedUserPreferences = {
  studyHours: { start: '09:00', end: '22:00' },
  breakDuration: 15,
  sessionDuration: 90,
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
  studySessionDuration: 120, // 2 hours
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
      addTask: (task) => {
        const taskId = uuidv4();
        const state = get();
        
        // Determine buffer days based on task type and preferences
        let bufferDays = 3; // default
        if (task.type === 'exam') {
          bufferDays = state.preferences.daysBeforeExam || 7;
        } else if (task.type === 'assignment') {
          bufferDays = state.preferences.daysBeforeAssignment || 3;
        } else if (task.type === 'project') {
          bufferDays = state.preferences.daysBeforeProject || 10;
        } else if (task.type === 'reading') {
          bufferDays = 2; // Less buffer for readings
        }
        
        // Create the task
        const newTask: ExtendedTask = { ...task, id: taskId, bufferDays };
        set((state) => ({
          tasks: [...state.tasks, newTask],
        }));
        
        // Create a deadline event (visual representation of DUE date)
        // This is the HARD deadline - when it's actually due
        const deadlineEvent = {
          id: uuidv4(),
          title: `DUE: ${task.title}`,
          type: 'deadline' as const,
          courseId: task.courseId,
          startTime: task.dueDate,
          endTime: new Date(task.dueDate.getTime() + 30 * 60 * 1000), // 30 min block for visibility
          description: `Deadline for ${task.title}`,
          taskId: taskId,
        };
        
        set((state) => ({
          events: [...state.events, deadlineEvent],
        }));
        
        // Schedule DO blocks for the task (work time before deadline)
        if (task.estimatedHours > 0) {
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
        if (!task || task.estimatedHours === 0) {
          console.log(`Skipping scheduling for task ${taskId} - no estimated hours`);
          return;
        }
        
        console.log(`Scheduling task: ${task.title}, estimated hours: ${task.estimatedHours}, buffer days: ${task.bufferDays}`);
        
        // Calculate soft deadline (when work should be completed)
        const softDeadline = subDays(task.dueDate, task.bufferDays || 3);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Start date is either today or some days before soft deadline
        const idealStartDate = subDays(softDeadline, Math.ceil(task.estimatedHours / 2)); // Start early enough
        const startDate = isAfter(today, idealStartDate) ? today : idealStartDate;
        
        // Create DO blocks (study/work time) using the improved scheduler
        const newBlocks = get().createStudyBlocks(task, startDate, softDeadline, task.estimatedHours);

        console.log(`Created ${newBlocks.length} DO blocks for task ${task.title}`);

        // Add all the new blocks
        if (newBlocks.length > 0) {
          set((state) => ({
            timeBlocks: [...state.timeBlocks, ...newBlocks]
          }));
        }
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
      
      // Helper method to create study blocks with proper scheduling logic
      createStudyBlocks: (task, startDate, endDate, totalHours) => {
        const newBlocks: TimeBlock[] = [];
        
        console.log(`\n=== Creating study blocks for ${task.title} ===`);
        console.log(`Total hours: ${totalHours}, Start: ${startDate.toDateString()}, End: ${endDate.toDateString()}`);
        
        // Calculate days available and max hours per day
        const daysAvailable = Math.max(1, differenceInDays(endDate, startDate) + 1);
        const maxHoursPerDay = Math.min(totalHours / daysAvailable, 2);
        
        console.log(`Days available: ${daysAvailable}, Max hours per day: ${maxHoursPerDay}`);
        
        let remainingHours = totalHours;
        let currentDate = new Date(startDate);
        
        while (remainingHours > 0 && currentDate <= endDate) {
          console.log(`\n--- Processing ${currentDate.toDateString()} ---`);
          console.log(`Hours needed: ${Math.min(remainingHours, maxHoursPerDay)}, Remaining: ${remainingHours}`);
          
          // Get available time slots for this day
          const availableSlots = get().getAvailableTimeSlots(currentDate);
          
          if (availableSlots.length === 0) {
            console.log(`No available slots on ${currentDate.toDateString()}`);
            currentDate = addDays(currentDate, 1);
            continue;
          }
          
          const hoursForToday = Math.min(remainingHours, maxHoursPerDay);
          let scheduledToday = 0;
          
          for (const slot of availableSlots) {
            if (scheduledToday >= hoursForToday) break;
            
            const slotDuration = (slot.end.getTime() - slot.start.getTime()) / (1000 * 60 * 60);
            const sessionDuration = Math.min(
              hoursForToday - scheduledToday,
              slotDuration,
              1.5 // Max 1.5 hour sessions
            );
            
            if (sessionDuration >= 0.5) { // Minimum 30 minutes
              const blockStart = new Date(slot.start);
              const blockEnd = new Date(blockStart.getTime() + sessionDuration * 60 * 60 * 1000);
              
              const newBlock: TimeBlock = {
                id: uuidv4(),
                taskId: task.id,
                startTime: blockStart,
                endTime: blockEnd,
                completed: false
              };
              
              newBlocks.push(newBlock);
              scheduledToday += sessionDuration;
              
              console.log(`Created block: ${format(blockStart, 'HH:mm')} - ${format(blockEnd, 'HH:mm')} (${sessionDuration}h)`);
              
              // Update slot for next iteration
              slot.start = new Date(blockEnd.getTime() + 15 * 60 * 1000); // 15 min break
            }
          }
          
          remainingHours -= scheduledToday;
          console.log(`Day complete. Scheduled: ${scheduledToday}h, Remaining: ${remainingHours}h`);
          
          currentDate = addDays(currentDate, 1);
        }
        
        console.log(`\n=== Created ${newBlocks.length} DO blocks for task ${task.title} ===`);
        return newBlocks;
      },
      
      // Helper method to get available time slots for a day
      getAvailableTimeSlots: (date) => {
        const slots: Array<{ start: Date; end: Date }> = [];
        
        // Study hours for the day
        const dayStart = new Date(date);
        dayStart.setHours(9, 0, 0, 0); // 9 AM
        const dayEnd = new Date(date);
        dayEnd.setHours(17, 0, 0, 0); // 5 PM
        
        // Get all busy times (courses, events, existing blocks)
        const busyTimes = get().getBusyTimesForDay(date);
        
        console.log(`Date: ${date.toDateString()}, Study hours: ${format(dayStart, 'HH:mm')} - ${format(dayEnd, 'HH:mm')}, Busy times: ${busyTimes.length}`);
        
        if (busyTimes.length === 0) {
          console.log(`No conflicts, full slot available: ${(dayEnd.getTime() - dayStart.getTime()) / (1000 * 60 * 60)} hours`);
          return [{ start: dayStart, end: dayEnd }];
        }
        
        // Sort busy times by start time
        busyTimes.sort((a, b) => a.start.getTime() - b.start.getTime());
        
        let currentTime = dayStart;
        
        for (const busy of busyTimes) {
          if (currentTime < busy.start) {
            const slotDuration = (busy.start.getTime() - currentTime.getTime()) / (1000 * 60 * 60);
            if (slotDuration >= 0.5) { // At least 30 minutes
              slots.push({ start: new Date(currentTime), end: new Date(busy.start) });
              console.log(`Found slot: ${format(currentTime, 'HH:mm')} - ${format(busy.start, 'HH:mm')} (${slotDuration}h)`);
            }
          }
          currentTime = new Date(Math.max(currentTime.getTime(), busy.end.getTime()));
        }
        
        // Final slot after last busy time
        if (currentTime < dayEnd) {
          const slotDuration = (dayEnd.getTime() - currentTime.getTime()) / (1000 * 60 * 60);
          if (slotDuration >= 0.5) {
            slots.push({ start: new Date(currentTime), end: dayEnd });
            console.log(`Found final slot: ${format(currentTime, 'HH:mm')} - ${format(dayEnd, 'HH:mm')} (${slotDuration}h)`);
          }
        }
        
        console.log(`Valid slots found: ${slots.length}`);
        return slots;
      },
      
      // Helper method to get busy times for a specific day
      getBusyTimesForDay: (date) => {
        const state = get();
        const busyTimes: Array<{ start: Date; end: Date }> = [];
        const dayOfWeek = date.getDay();
        
        // Add course schedule conflicts
        for (const course of state.courses) {
          const daySchedule = course.schedule.filter(s => s.dayOfWeek === dayOfWeek);
          for (const schedule of daySchedule) {
            const [startHour, startMin] = schedule.startTime.split(':').map(Number);
            const [endHour, endMin] = schedule.endTime.split(':').map(Number);
            
            const start = new Date(date);
            start.setHours(startHour, startMin, 0, 0);
            const end = new Date(date);
            end.setHours(endHour, endMin, 0, 0);
            
            busyTimes.push({ start, end });
            console.log(`Course conflict: ${course.code} ${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`);
          }
        }
        
        // Add events for this day
        const dayEvents = state.events.filter(event => 
          isSameDay(event.startTime, date)
        );
        
        for (const event of dayEvents) {
          busyTimes.push({ start: event.startTime, end: event.endTime });
          console.log(`Event conflict: ${event.title} ${format(event.startTime, 'HH:mm')} - ${format(event.endTime, 'HH:mm')}`);
        }
        
        // Add existing time blocks
        const dayBlocks = state.timeBlocks.filter(block => 
          isSameDay(block.startTime, date)
        );
        
        for (const block of dayBlocks) {
          busyTimes.push({ start: block.startTime, end: block.endTime });
          console.log(`Block conflict: ${format(block.startTime, 'HH:mm')} - ${format(block.endTime, 'HH:mm')}`);
        }
        
        // Merge overlapping busy times
        if (busyTimes.length <= 1) return busyTimes;
        
        busyTimes.sort((a, b) => a.start.getTime() - b.start.getTime());
        const merged = [busyTimes[0]];
        
        for (let i = 1; i < busyTimes.length; i++) {
          const current = busyTimes[i];
          const last = merged[merged.length - 1];
          
          if (current.start <= last.end) {
            last.end = new Date(Math.max(last.end.getTime(), current.end.getTime()));
          } else {
            merged.push(current);
          }
        }
        
        return merged;
      },
      
      updatePreferences: (preferences) => set((state) => ({
        preferences: { ...state.preferences, ...preferences },
      })),
    }),
    {
      name: 'schedule-store',
    }
  )
);