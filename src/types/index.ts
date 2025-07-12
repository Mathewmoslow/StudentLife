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
  bufferPercentage?: number;
  materials?: string[];
  dependencies?: string[];
  scheduledBlocks: TimeBlock[];
  status: 'not-started' | 'in-progress' | 'completed';
  description?: string;
  attachments?: string[];
  priority?: number;
  bufferDays?: number;
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
  studyHours: {
    start: string;
    end: string;
  };
  breakDuration: number;
  sessionDuration: number;
  complexityDefaults: {
    assignment: number;
    exam: number;
    project: number;
    reading: number;
    lab: number;
  };
  bufferDefaults: {
    soft: number;
    hard: number;
  };
  energyLevels: {
    [hour: number]: number;
  };
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
  daysBeforeReading?: number;
  daysBeforeLab?: number;
  hoursPerWorkDay?: number;
  defaultHoursPerType?: {
    assignment: number;
    exam: number;
    project: number;
    reading: number;
    lab: number;
  };
  complexityMultipliers?: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
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
  taskId?: string;
}
