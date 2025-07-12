import { nursingCourses, nursingScheduleItems } from '../utils/nursingSampleData';
import { useScheduleStore } from '../stores/useScheduleStore';
import { parseISO, setHours, setMinutes } from 'date-fns';

export class DataLoader {
  static loadNursingData() {
    const store = useScheduleStore.getState();
    
    // Clear existing data
    this.clearAllData();
    
    // Load courses
    this.loadCourses();
    
    // Process schedule items
    this.processScheduleItems();
    
    // After loading, trigger scheduling for all tasks
    console.log('Data loaded, triggering task scheduling...');
    store.rescheduleAllTasks();
  }
  
  private static clearAllData() {
    const store = useScheduleStore.getState();
    store.courses.forEach(course => store.deleteCourse(course.id));
    store.events.forEach(event => store.deleteEvent(event.id));
    store.tasks.forEach(task => store.deleteTask(task.id));
  }
  
  private static loadCourses() {
    const store = useScheduleStore.getState();
    
    nursingCourses.forEach(courseData => {
      // Map course codes properly
      const courseCode = courseData.code;
      const schedule = this.getCourseSchedule(courseCode);
      
      store.addCourse({
        name: courseData.name,
        code: courseData.code,
        professor: courseData.professor,
        credits: courseData.credits,
        color: courseData.color,
        schedule: schedule
      });
    });
  }
  
  private static getCourseSchedule(courseCode: string) {
    // Define regular weekly schedules for each course
    switch(courseCode) {
      case 'NURS310': // Adult Health
        return [
          { dayOfWeek: 2, startTime: '09:00', endTime: '12:05', type: 'lecture' as const },
          { dayOfWeek: 3, startTime: '07:00', endTime: '17:00', type: 'lab' as const }
        ];
      case 'NURS315': // Gerontology
        return [
          { dayOfWeek: 1, startTime: '13:00', endTime: '16:00', type: 'lecture' as const }
        ];
      case 'NURS335': // NCLEX
        return [
          { dayOfWeek: 1, startTime: '09:00', endTime: '12:00', type: 'lecture' as const }
        ];
      case 'NURS330': // OB/GYN
        return [
          { dayOfWeek: 0, startTime: '09:00', endTime: '12:00', type: 'lecture' as const },
          { dayOfWeek: 1, startTime: '07:00', endTime: '17:00', type: 'lab' as const }
        ];
      default:
        return [];
    }
  }
  
  private static processScheduleItems() {
    const store = useScheduleStore.getState();
    
    // Define event types - these are scheduled class time (no "DO" blocks needed)
    const eventTypes = ['Lecture', 'Clinical', 'Lab', 'Simulation', 'Holiday', 'Review', 'Exam'];
    
    nursingScheduleItems.forEach(item => {
      // Map course code to course ID
      const courseCode = this.mapCourseCode(item.course);
      const course = store.courses.find(c => c.code === courseCode);
      if (!course) {
        console.warn(`Course not found for ${item.course}`);
        return;
      }
      
      const itemDate = item.date === 'TBD' ? new Date(2025, 7, 15) : parseISO(item.date);
      
      if (eventTypes.includes(item.type)) {
        // Create EVENT (scheduled class time)
        this.createEvent(item, course.id, itemDate);
      } else {
        // Create TASK (needs "DO" time scheduled)
        this.createTask(item, course.id, itemDate);
      }
    });
  }
  
  private static mapCourseCode(csvCourse: string): string {
    const mapping: Record<string, string> = {
      'Adult_310': 'NURS310',
      'Gerontology_315': 'NURS315',
      'NCLEX_335': 'NURS335',
      'OBGYN_330': 'NURS330'
    };
    return mapping[csvCourse] || csvCourse;
  }
  
  // Parse duration from CSV format (e.g., "0:02:28") to hours
  private static parseDuration(duration: string): number {
    if (!duration || duration === 'N/A' || duration === '0' || duration === 'TBD') {
      return 0; // Will use estimates later
    }
    
    const parts = duration.split(':');
    if (parts.length === 3) {
      const hours = parseInt(parts[0]) || 0;
      const minutes = parseInt(parts[1]) || 0;
      const seconds = parseInt(parts[2]) || 0;
      return hours + minutes/60 + seconds/3600;
    } else if (parts.length === 2) {
      const hours = parseInt(parts[0]) || 0;
      const minutes = parseInt(parts[1]) || 0;
      return hours + minutes/60;
    }
    
    return 0;
  }
  
  // Estimate hours based on task type when duration not provided
  private static estimateHours(type: string): number {
    const estimates: Record<string, number> = {
      'Assignment': 3,
      'Quiz': 1,
      'Reading': 2,
      'Video': 0.5,
      'Activity': 1,
      'Project': 8,
      'Simulation': 2, // For task-type simulations
    };
    return estimates[type] || 2;
  }
  
  // Estimate complexity based on type
  private static estimateComplexity(type: string, duration: number): 1 | 2 | 3 | 4 | 5 {
    if (type === 'Quiz') return 2;
    if (type === 'Assignment' || type === 'Activity') return 3;
    if (type === 'Reading' || type === 'Video') return 2;
    if (type === 'Project') return 4;
    
    // Also consider duration
    if (duration > 4) return 4;
    if (duration > 2) return 3;
    return 2;
  }
  
  private static createEvent(item: any, courseId: string, date: Date) {
    const store = useScheduleStore.getState();
    const duration = this.parseDuration(item.duration) || this.getDefaultEventDuration(item.type);
    
    // Set start times based on type
    let startHour = 9; // Default
    if (item.type === 'Clinical') {
      startHour = 7; // Clinical starts at 7 AM
    } else if (item.type === 'Exam') {
      startHour = 9; // Exams at 9 AM (replace lecture time)
    } else if (item.type === 'Lecture') {
      startHour = 9; // Lectures at 9 AM
    } else if (item.type === 'Lab') {
      startHour = 13; // Labs at 1 PM
    } else if (item.type === 'Simulation') {
      startHour = 13; // Simulations at 1 PM
    } else if (item.type === 'Review') {
      startHour = 14; // Review sessions at 2 PM
    }
    
    const startTime = setMinutes(setHours(date, startHour), 0);
    const endTime = new Date(startTime.getTime() + duration * 60 * 60 * 1000);
    
    store.addEvent({
      title: item.title.replace(/_/g, ' '),
      type: this.mapEventType(item.type),
      courseId,
      startTime,
      endTime,
      location: this.getLocation(item.type),
      description: `${item.type} for ${item.course.replace('_', ' ')}`
    });
  }
  
  private static createTask(item: any, courseId: string, dueDate: Date) {
    const store = useScheduleStore.getState();
    
    // Get duration from data or estimate
    let estimatedHours = this.parseDuration(item.duration);
    if (estimatedHours === 0) {
      estimatedHours = this.estimateHours(item.type);
    }
    
    const taskType = this.mapTaskType(item.type);
    const complexity = this.estimateComplexity(item.type, estimatedHours);
    
    console.log(`Creating task: ${item.title}, estimated hours: ${estimatedHours}, type: ${item.type}`);
    
    // addTask will automatically:
    // 1. Create a "DUE" deadline event
    // 2. Schedule "DO" time blocks with appropriate buffer
    store.addTask({
      title: item.title.replace(/_/g, ' '),
      courseId,
      type: taskType,
      dueDate,
      estimatedHours,
      complexity,
      description: `${item.type} for ${item.course.replace('_', ' ')}`,
      isHardDeadline: true,
      bufferDays: 0, // Will be set by store based on type
      scheduledBlocks: [],
      status: 'not-started'
    });
  }
  
  private static mapTaskType(type: string): 'assignment' | 'project' | 'reading' | 'exam' | 'lab' {
    switch(type.toLowerCase()) {
      case 'quiz':
        return 'exam'; // Quizzes are like mini-exams for scheduling
      case 'assignment':
      case 'activity':
        return 'assignment';
      case 'reading':
      case 'video':
        return 'reading';
      case 'project':
        return 'project';
      default:
        return 'assignment';
    }
  }
  
  private static mapEventType(type: string): 'lecture' | 'clinical' | 'lab' | 'exam' | 'simulation' | 'review' | 'deadline' {
    switch(type.toLowerCase()) {
      case 'lecture':
        return 'lecture';
      case 'clinical':
        return 'clinical';
      case 'lab':
        return 'lab';
      case 'exam':
        return 'exam';
      case 'simulation':
        return 'simulation';
      case 'review':
        return 'review';
      default:
        return 'lecture';
    }
  }
  
  private static getDefaultEventDuration(type: string): number {
    const durations: Record<string, number> = {
      'Clinical': 10, // 10 hours
      'Exam': 2, // 2 hours
      'Lecture': 3, // 3 hours
      'Lab': 4, // 4 hours
      'Simulation': 3.5, // 3.5 hours
      'Review': 2, // 2 hours
    };
    return durations[type] || 2;
  }
  
  private static getLocation(type: string): string {
    const locationMap: Record<string, string> = {
      'Clinical': 'Hospital',
      'Lab': 'Skills Lab',
      'Exam': 'Testing Center',
      'Simulation': 'Simulation Lab',
      'Lecture': 'Classroom',
      'Review': 'Study Room'
    };
    return locationMap[type] || 'TBD';
  }
}
