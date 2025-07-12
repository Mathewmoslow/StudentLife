// src/core/algorithms/studyScheduler.ts

import { addDays, startOfDay, endOfDay, isWeekend, differenceInDays, isBefore, isAfter, setHours, setMinutes } from 'date-fns';
import { Task, TimeBlock } from '../../types';

interface StudyBlock {
  id: string;
  taskId: string;
  courseId: string;
  title: string;
  type: 'study' | 'review';
  date: string;
  start: string;
  end: string;
  hours: number;
  priority: string;
  energyRequired: string;
  assignmentTitle: string;
  assignmentType: string;
}

interface ExistingEvent {
  id: string;
  start: Date;
  end: Date;
  type: string;
}

interface Preferences {
  dailyMaxHours: number;
  weekendMaxHours: number;
  blockDuration: number;
  preferredTimes: {
    morning: { start: number; end: number; weight: number };
    afternoon: { start: number; end: number; weight: number };
    evening: { start: number; end: number; weight: number };
  };
  energyLevels: {
    [key: string]: number;
  };
  bufferBeforeExam?: number;
  reviewPercentage?: number;
  breakBetweenBlocks?: number;
}

export class StudyScheduler {
  private studyBlocks: StudyBlock[] = [];
  private preferences: Preferences = {
    dailyMaxHours: 6,
    weekendMaxHours: 4,
    blockDuration: 1.5,
    preferredTimes: {
      morning: { start: 8, end: 12, weight: 1 },
      afternoon: { start: 13, end: 17, weight: 1 },
      evening: { start: 18, end: 22, weight: 1 }
    },
    energyLevels: {
      monday: 0.9,
      tuesday: 1.0,
      wednesday: 0.95,
      thursday: 0.85,
      friday: 0.7,
      saturday: 0.8,
      sunday: 0.9
    },
    bufferBeforeExam: 2,
    reviewPercentage: 0.2,
    breakBetweenBlocks: 0.25
  };

  /**
   * Generate study schedule for all tasks
   */
  generateSchedule(
    tasks: Task[], 
    courses: any[], 
    existingEvents: ExistingEvent[], 
    startDate: Date, 
    endDate: Date
  ): StudyBlock[] {
    this.studyBlocks = [];
    
    // Filter and prepare tasks
    const tasksToSchedule = tasks
      .filter(task => task.status !== 'completed' && task.estimatedHours > 0)
      .map(task => ({
        ...task,
        totalHours: this.calculateStudyTime(task),
        hoursScheduled: 0,
        completed: false
      }));

    // Sort by priority and due date
    const prioritizedTasks = this.prioritizeTasks(tasksToSchedule);

    // Schedule each task
    prioritizedTasks.forEach(task => {
      this.scheduleTask(task, existingEvents, startDate, endDate);
    });

    // Add review sessions for exams
    this.addReviewSessions(prioritizedTasks, existingEvents, startDate, endDate);

    // Optimize schedule
    this.optimizeForEnergyLevels();

    return this.studyBlocks;
  }

  /**
   * Calculate total study time needed
   */
  private calculateStudyTime(task: Task): number {
    let baseHours = task.estimatedHours;
    
    // Apply complexity multiplier
    const complexityMultiplier = 0.5 + (task.complexity * 0.3);
    baseHours *= complexityMultiplier;
    
    // Apply type multiplier
    const typeMultipliers: { [key: string]: number } = {
      'exam': 1.5,
      'project': 1.3,
      'assignment': 1.0,
      'reading': 0.9,
      'lab': 0.8
    };
    baseHours *= typeMultipliers[task.type] || 1.0;
    
    // Add buffer time
    const bufferMultiplier = 1 + (task.bufferPercentage / 100);
    baseHours *= bufferMultiplier;
    
    // Add review time for exams
    if (task.type === 'exam') {
      baseHours += baseHours * (this.preferences.reviewPercentage || 0.2);
    }
    
    return Math.round(baseHours * 2) / 2; // Round to nearest 0.5
  }

  /**
   * Prioritize tasks by urgency and importance
   */
  private prioritizeTasks(tasks: any[]): any[] {
    return tasks.sort((a, b) => {
      // Calculate urgency score (days until due)
      const daysUntilA = differenceInDays(a.dueDate, new Date());
      const daysUntilB = differenceInDays(b.dueDate, new Date());
      
      // Urgency factor (exponential decay)
      const urgencyA = Math.exp(-daysUntilA / 7);
      const urgencyB = Math.exp(-daysUntilB / 7);
      
      // Importance factor (based on type and complexity)
      const importanceA = (a.complexity / 5) * (a.type === 'exam' ? 2 : 1);
      const importanceB = (b.complexity / 5) * (b.type === 'exam' ? 2 : 1);
      
      // Combined score
      const scoreA = urgencyA * 0.7 + importanceA * 0.3;
      const scoreB = urgencyB * 0.7 + importanceB * 0.3;
      
      return scoreB - scoreA;
    });
  }

  /**
   * Schedule a single task
   */
  private scheduleTask(task: any, existingEvents: ExistingEvent[], startDate: Date, endDate: Date): void {
    const dueDate = new Date(task.dueDate);
    const bufferDays = task.type === 'exam' ? 3 : task.bufferDays || 2;
    
    // Calculate ideal start date
    const daysNeeded = Math.ceil(task.totalHours / this.preferences.dailyMaxHours);
    const idealStartDate = addDays(dueDate, -(daysNeeded + bufferDays));
    const actualStartDate = isAfter(idealStartDate, startDate) ? idealStartDate : startDate;
    
    let currentDate = new Date(actualStartDate);
    let remainingHours = task.totalHours;
    
    while (remainingHours > 0 && isBefore(currentDate, dueDate) && isBefore(currentDate, endDate)) {
      const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const energyLevel = this.preferences.energyLevels[dayName] || 1;
      const isWeekendDay = isWeekend(currentDate);
      
      // Calculate max hours for this day
      const baseMaxHours = isWeekendDay ? 
        this.preferences.weekendMaxHours : 
        this.preferences.dailyMaxHours;
      const adjustedMaxHours = baseMaxHours * energyLevel;
      
      // Check existing hours scheduled
      const scheduledHours = this.getScheduledHours(currentDate);
      const availableHours = Math.max(0, adjustedMaxHours - scheduledHours);
      
      if (availableHours > 0) {
        const hoursToSchedule = Math.min(
          this.preferences.blockDuration,
          remainingHours,
          availableHours
        );
        
        if (hoursToSchedule >= 0.5) {
          const timeSlot = this.findBestTimeSlot(
            currentDate,
            hoursToSchedule,
            existingEvents,
            task.type
          );
          
          if (timeSlot) {
            this.studyBlocks.push({
              id: `study_${task.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              taskId: task.id,
              courseId: task.courseId,
              title: `Study: ${task.title}`,
              type: 'study',
              date: timeSlot.date,
              start: timeSlot.start,
              end: timeSlot.end,
              hours: hoursToSchedule,
              priority: task.isHardDeadline ? 'high' : 'medium',
              energyRequired: this.getEnergyRequired(task.type),
              assignmentTitle: task.title,
              assignmentType: task.type
            });
            
            remainingHours -= hoursToSchedule;
          }
        }
      }
      
      currentDate = addDays(currentDate, 1);
    }
  }

  /**
   * Find best time slot for studying
   */
  private findBestTimeSlot(
    date: Date, 
    hours: number, 
    existingEvents: ExistingEvent[], 
    taskType: string
  ): { date: string; start: string; end: string } | null {
    const dayEvents = existingEvents.filter(event => {
      const eventDate = event.start;
      return startOfDay(eventDate).getTime() === startOfDay(date).getTime();
    });
    
    // Get preferred times based on task type
    const preferredPeriods = this.getPreferredPeriods(taskType);
    
    for (const periodName of preferredPeriods) {
      const period = this.preferences.preferredTimes[periodName as keyof typeof this.preferences.preferredTimes];
      if (!period) continue;
      
      const slots = this.findAvailableSlots(date, period.start, period.end, dayEvents, hours);
      if (slots.length > 0) {
        return slots[0];
      }
    }
    
    return null;
  }

  /**
   * Get preferred study periods based on task type
   */
  private getPreferredPeriods(taskType: string): string[] {
    const preferences: { [key: string]: string[] } = {
      'exam': ['morning', 'afternoon'],
      'reading': ['evening', 'afternoon'],
      'project': ['afternoon', 'morning'],
      'assignment': ['afternoon', 'evening'],
      'lab': ['morning', 'afternoon']
    };
    
    return preferences[taskType] || ['morning', 'afternoon', 'evening'];
  }

  /**
   * Find available time slots
   */
  private findAvailableSlots(
    date: Date, 
    periodStart: number, 
    periodEnd: number, 
    dayEvents: ExistingEvent[], 
    hoursNeeded: number
  ): { date: string; start: string; end: string }[] {
    const slots: { date: string; start: string; end: string }[] = [];
    let currentTime = setMinutes(setHours(date, periodStart), 0);
    const endTime = setMinutes(setHours(date, periodEnd), 0);
    
    while (currentTime < endTime) {
      const slotEnd = new Date(currentTime.getTime() + hoursNeeded * 60 * 60 * 1000);
      
      // Check conflicts
      const hasConflict = dayEvents.some(event => {
        return (currentTime < event.end && slotEnd > event.start);
      });
      
      if (!hasConflict && slotEnd <= endTime) {
        slots.push({
          date: date.toISOString().split('T')[0],
          start: currentTime.toISOString(),
          end: slotEnd.toISOString()
        });
      }
      
      // Move to next slot
      currentTime = new Date(currentTime.getTime() + 30 * 60 * 1000); // 30 min increments
    }
    
    return slots;
  }

  /**
   * Get total hours already scheduled for a day
   */
  private getScheduledHours(date: Date): number {
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);
    
    return this.studyBlocks
      .filter(block => {
        const blockStart = new Date(block.start);
        return blockStart >= dayStart && blockStart <= dayEnd;
      })
      .reduce((total, block) => total + block.hours, 0);
  }

  /**
   * Add review sessions before exams
   */
  private addReviewSessions(
    tasks: any[], 
    existingEvents: ExistingEvent[], 
    startDate: Date, 
    endDate: Date
  ): void {
    const exams = tasks.filter(t => t.type === 'exam');
    
    exams.forEach(exam => {
      const examDate = new Date(exam.dueDate);
      const reviewDays = this.preferences.bufferBeforeExam || 2;
      
      for (let i = 1; i <= reviewDays; i++) {
        const reviewDate = addDays(examDate, -i);
        if (isAfter(reviewDate, startDate) && isBefore(reviewDate, endDate)) {
          const reviewHours = 2;
          
          const timeSlot = this.findBestTimeSlot(
            reviewDate,
            reviewHours,
            existingEvents,
            'review'
          );
          
          if (timeSlot) {
            this.studyBlocks.push({
              id: `review_${exam.id}_${i}_${Date.now()}`,
              taskId: exam.id,
              courseId: exam.courseId,
              title: `Review: ${exam.title}`,
              type: 'review',
              date: timeSlot.date,
              start: timeSlot.start,
              end: timeSlot.end,
              hours: reviewHours,
              priority: 'high',
              energyRequired: 'high',
              assignmentTitle: exam.title,
              assignmentType: 'exam'
            });
          }
        }
      }
    });
  }

  /**
   * Optimize schedule based on energy levels
   */
  private optimizeForEnergyLevels(): void {
    // Group blocks by energy requirement
    const highEnergyBlocks = this.studyBlocks.filter(b => 
      this.getEnergyRequired(b.assignmentType) === 'high'
    );
    
    // Check if high-energy tasks are scheduled on low-energy days
    highEnergyBlocks.forEach(block => {
      const blockDate = new Date(block.start);
      const dayName = blockDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const energyLevel = this.preferences.energyLevels[dayName];
      
      if (energyLevel < 0.8) {
        // Mark as suboptimal (in a real implementation, we'd try to reschedule)
        console.log(`Warning: High-energy task scheduled on low-energy day (${dayName})`);
      }
    });
  }

  /**
   * Get energy requirement for task type
   */
  private getEnergyRequired(type: string): string {
    const energyLevels: { [key: string]: string } = {
      'exam': 'high',
      'project': 'high',
      'assignment': 'medium',
      'reading': 'medium',
      'lab': 'medium'
    };
    return energyLevels[type] || 'medium';
  }

  /**
   * Update preferences
   */
  updatePreferences(newPreferences: Partial<Preferences>): void {
    this.preferences = { ...this.preferences, ...newPreferences };
  }

  /**
   * Get statistics
   */
  getStatistics(): any {
    const totalHours = this.studyBlocks.reduce((sum, block) => sum + block.hours, 0);
    const byType: { [key: string]: number } = {};
    const byCourse: { [key: string]: number } = {};
    const byDay: { [key: string]: number } = {};
    
    this.studyBlocks.forEach(block => {
      // By type
      byType[block.type] = (byType[block.type] || 0) + block.hours;
      
      // By course
      byCourse[block.courseId] = (byCourse[block.courseId] || 0) + block.hours;
      
      // By day
      const day = new Date(block.start).toLocaleDateString('en-US', { weekday: 'long' });
      byDay[day] = (byDay[day] || 0) + block.hours;
    });
    
    return {
      totalHours,
      averagePerDay: totalHours / 7,
      byType,
      byCourse,
      byDay,
      blockCount: this.studyBlocks.length
    };
  }

  /**
   * Export for calendar
   */
  exportForCalendar(): any[] {
    return this.studyBlocks.map(block => ({
      id: block.id,
      title: block.title,
      start: block.start,
      end: block.end,
      backgroundColor: block.type === 'review' ? '#8b5cf6' : '#10b981',
      textColor: '#ffffff',
      extendedProps: {
        type: block.type,
        taskId: block.taskId,
        courseId: block.courseId,
        hours: block.hours,
        priority: block.priority,
        energyRequired: block.energyRequired,
        assignmentTitle: block.assignmentTitle
      }
    }));
  }
}