export interface Task {
  id: string;
  title: string;
  type: 'assignment' | 'exam' | 'project' | 'reading' | 'lab';
  courseId: string;
  dueDate: Date;
  complexity: 1 | 2 | 3 | 4 | 5;
  estimatedHours: number;
  actualHours?: number;
  isHardDeadline: boolean;
  bufferDays?: number; // Optional - will be auto-calculated if not provided
  materials?: string[];
  dependencies?: string[];
  scheduledBlocks: TimeBlock[];
  status: 'not-started' | 'in-progress' | 'completed';
  description?: string;
  attachments?: string[];
  priority?: number;
}

export interface TimeBlock {
  id: string;
  taskId: string;
  startTime: Date;
  endTime: Date;
  completed: boolean;
  actualDuration?: number;
  location?: string;
  notes?: string;
  type?: 'study' | 'review' | 'work';
  isManual?: boolean;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  professor: string;
  schedule: RecurringEvent[];
  color: string;
  credits: number;
  syllabusUrl?: string;
  officeHours?: RecurringEvent[];
  room?: string;
}

export interface RecurringEvent {
  dayOfWeek: number; // 0-6
  startTime: string; // "14:30"
  endTime: string;   // "15:45"
  room?: string;
  type: 'lecture' | 'lab' | 'tutorial' | 'office-hours';
}

export interface UserPreferences {
  // Study session settings
  studySessionDuration: number; // minutes per session
  breakDuration: number; // minutes between sessions
  maxDailyStudyHours: number; // max hours per day
  hoursPerWorkDay: number; // average work hours per day for scheduling
  
  // Time preferences
  preferredStudyTimes: {
    morning: boolean;   // 6-12
    afternoon: boolean; // 12-18  
    evening: boolean;   // 18-22
    night: boolean;     // 22-24
  };
  
  // Buffer days by task type (days before deadline to finish)
  daysBeforeExam: number;
  daysBeforeAssignment: number;
  daysBeforeProject: number;
  daysBeforeReading: number;
  daysBeforeLab: number;
  
  // Default hours by task type
  defaultHoursPerType: {
    assignment: number;
    exam: number;      // Study hours for exam prep
    project: number;
    reading: number;
    lab: number;
  };
  
  // Complexity multipliers (applied to base hours)
  complexityMultipliers: {
    1: number;   // Very easy
    2: number;   // Easy  
    3: number;   // Medium
    4: number;   // Hard
    5: number;   // Very hard
  };
}

export interface ScheduleConflict {
  type: 'overlap' | 'insufficient-time' | 'too-many-hours';
  blocks: TimeBlock[];
  message: string;
  severity: 'warning' | 'error';
}

export interface Event {
  id: string;
  title: string;
  type: 'lecture' | 'clinical' | 'lab' | 'exam' | 'simulation' | 'review' | 'deadline';
  courseId: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  description?: string;
  taskId?: string; // For deadline events linked to tasks
}

// Helper type for creating tasks without requiring all optional fields
export type CreateTaskData = Pick<Task, 'title' | 'type' | 'courseId' | 'dueDate' | 'complexity' | 'status'> & 
  Partial<Pick<Task, 'estimatedHours' | 'isHardDeadline' | 'bufferDays' | 'description' | 'scheduledBlocks' | 'materials' | 'dependencies' | 'actualHours' | 'attachments' | 'priority'>>;