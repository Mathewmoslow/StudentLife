import React, { useState } from 'react';
import { useScheduleStore } from '../../stores/useScheduleStore';
import { Event } from '../../types';
import { format, startOfWeek, addDays, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from 'date-fns';
import styles from './SchedulerView.module.css';
import EventModal from './EventModal';

type ViewType = 'week' | 'day' | 'month';

const SchedulerView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<ViewType>('week');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedTimeBlock, setSelectedTimeBlock] = useState<any>(null);
  
  const { timeBlocks, tasks, events, courses } = useScheduleStore();
  
  const hours = Array.from({ length: 16 }, (_, i) => i + 6); // 6 AM to 9 PM
  
  // Helper function to ensure Date objects
  const ensureDate = (date: Date | string): Date => {
    return typeof date === 'string' ? new Date(date) : date;
  };
  
  // Get the days to display based on view type
  const getDaysToDisplay = () => {
    switch (viewType) {
      case 'day':
        return [currentDate];
      case 'week':
        const weekStart = startOfWeek(currentDate);
        return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
      case 'month':
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        return eachDayOfInterval({ start: monthStart, end: monthEnd });
      default:
        return [];
    }
  };
  
  const days = getDaysToDisplay();
  
  // Deduplicate events and blocks with proper date handling
  const getUniqueEventsForDay = (day: Date) => {
    const dayEvents = events.filter(event => isSameDay(ensureDate(event.startTime), day));
    // Remove duplicates based on ID
    const uniqueEvents = Array.from(
      new Map(dayEvents.map(event => [event.id, event])).values()
    );
    return uniqueEvents;
  };
  
  const getUniqueBlocksForDay = (day: Date) => {
    const dayBlocks = timeBlocks.filter(block => isSameDay(ensureDate(block.startTime), day));
    // Remove duplicates based on ID
    const uniqueBlocks = Array.from(
      new Map(dayBlocks.map(block => [block.id, block])).values()
    );
    return uniqueBlocks;
  };
  
  const getTaskForBlock = (blockId: string) => {
    const block = timeBlocks.find(b => b.id === blockId);
    return tasks.find(t => t.id === block?.taskId);
  };
  
  const getCourseForEvent = (event: Event) => {
    return courses.find(c => c.id === event.courseId);
  };
  
  const getEventColor = (event: Event) => {
    // Special colors for deadline events
    if (event.type === 'deadline') {
      return '#dc2626'; // Red for deadlines
    }
    
    const course = getCourseForEvent(event);
    if (course) return course.color;
    
    switch (event.type) {
      case 'exam': return '#ef4444';
      case 'clinical': return '#8b5cf6';
      case 'lab': return '#f59e0b';
      case 'simulation': return '#10b981';
      default: return '#3b82f6';
    }
  };
  
  const navigateDate = (direction: number) => {
    switch (viewType) {
      case 'day':
        setCurrentDate(addDays(currentDate, direction));
        break;
      case 'week':
        setCurrentDate(addDays(currentDate, direction * 7));
        break;
      case 'month':
        setCurrentDate(addDays(currentDate, direction * 30));
        break;
    }
  };
  
  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
  };
  
  const handleBlockClick = (block: any) => {
    const task = getTaskForBlock(block.id);
    setSelectedTimeBlock({ block, task });
  };
  
  // Week/Day View Component
  const WeekDayView = () => (
    <div className={styles.calendarWrapper}>
      <div className={styles.calendar}>
        <div className={styles.timeColumn}>
          <div className={styles.spacer}></div>
          {hours.map(hour => (
            <div key={hour} className={styles.timeLabel}>
              {format(new Date().setHours(hour, 0), 'h a')}
            </div>
          ))}
        </div>
        
        <div className={styles.daysContainer}>
          {days.map(day => {
            const dayString = day.toISOString();
            const dayEvents = getUniqueEventsForDay(day);
            const dayBlocks = getUniqueBlocksForDay(day);
            
            return (
              <div key={dayString} className={styles.dayColumn}>
                <div className={`${styles.dayHeader} ${isToday(day) ? styles.today : ''}`}>
                  <div className={styles.dayName}>{format(day, 'EEE')}</div>
                  <div className={styles.dayDate}>{format(day, 'd')}</div>
                </div>
                
                <div className={styles.dayGrid}>
                  {/* Render Events */}
                  {dayEvents.map(event => {
                    const startTime = ensureDate(event.startTime);
                    const endTime = ensureDate(event.endTime);
                    const startHour = startTime.getHours() + startTime.getMinutes() / 60;
                    const endHour = endTime.getHours() + endTime.getMinutes() / 60;
                    const duration = endHour - startHour;
                    const course = getCourseForEvent(event);
                    
                    return (
                      <div
                        key={event.id}
                        className={styles.eventBlock}
                        data-type={event.type}
                        style={{
                          top: `${(startHour - 6) * 60}px`,
                          height: `${duration * 60 - 4}px`,
                          backgroundColor: getEventColor(event),
                        }}
                        onClick={() => handleEventClick(event)}
                        title={`${event.title} - ${course?.name || 'Unknown Course'}`}
                      >
                        <div className={styles.blockContent}>
                          <div className={styles.blockTitle}>
                            {event.type === 'deadline' ? '⚠️ ' : ''}{event.title}
                          </div>
                          <div className={styles.blockMeta}>
                            <span>{course?.code || 'N/A'}</span>
                            <span>{format(startTime, 'h:mm a')}</span>
                          </div>
                          {event.location && <div className={styles.blockLocation}>📍 {event.location}</div>}
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Render Study Blocks */}
                  {dayBlocks.map(block => {
                    const task = getTaskForBlock(block.id);
                    const startTime = ensureDate(block.startTime);
                    const endTime = ensureDate(block.endTime);
                    const startHour = startTime.getHours() + startTime.getMinutes() / 60;
                    const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
                    
                    return (
                      <div
                        key={block.id}
                        className={styles.studyBlock}
                        style={{
                          top: `${(startHour - 6) * 60}px`,
                          height: `${duration * 60 - 4}px`,
                        }}
                        onClick={() => handleBlockClick(block)}
                      >
                        <div className={styles.blockContent}>
                          <div className={styles.blockTitle}>✏️ DO: {task?.title || 'Study Session'}</div>
                          <div className={styles.blockTime}>
                            {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
                          </div>
                          {block.completed && <div className={styles.blockCompleted}>✅ Completed</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
  
  // Month View Component
  const MonthView = () => {
    const weeks = [];
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    
    // Start from the beginning of the week that contains the first day of the month
    let currentWeekStart = startOfWeek(monthStart);
    
    while (currentWeekStart <= monthEnd) {
      const week = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
      weeks.push(week);
      currentWeekStart = addDays(currentWeekStart, 7);
    }
    
    return (
      <div className={styles.monthView}>
        <div className={styles.monthHeader}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className={styles.monthHeaderDay}>{day}</div>
          ))}
        </div>
        
        <div className={styles.monthGrid}>
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className={styles.monthWeek}>
              {week.map(day => {
                const dayEvents = getUniqueEventsForDay(day);
                const dayBlocks = getUniqueBlocksForDay(day);
                const isCurrentMonth = isSameDay(day, currentDate) || 
                  (day >= monthStart && day <= monthEnd);
                
                return (
                  <div 
                    key={day.toISOString()} 
                    className={`${styles.monthDay} ${!isCurrentMonth ? styles.otherMonth : ''} ${isToday(day) ? styles.today : ''}`}
                  >
                    <div className={styles.monthDayNumber}>{format(day, 'd')}</div>
                    <div className={styles.monthDayEvents}>
                      {dayEvents.slice(0, 3).map(event => {
                        const course = getCourseForEvent(event);
                        const startTime = ensureDate(event.startTime);
                        return (
                          <div 
                            key={event.id} 
                            className={styles.monthEvent}
                            style={{ backgroundColor: getEventColor(event) }}
                            onClick={() => handleEventClick(event)}
                            title={`${event.title} - ${course?.name || 'Unknown'}`}
                          >
                            {event.type === 'deadline' ? '⚠️ ' : ''}
                            {format(startTime, 'h:mm')} {event.title}
                          </div>
                        );
                      })}
                      {dayBlocks.slice(0, 2).map(block => {
                        const task = getTaskForBlock(block.id);
                        return (
                          <div 
                            key={block.id} 
                            className={styles.monthStudyBlock}
                            onClick={() => handleBlockClick(block)}
                            title={`DO: ${task?.title || 'Study Session'}`}
                          >
                            ✏️ DO: {task?.title || 'Study'}
                          </div>
                        );
                      })}
                      {(dayEvents.length + dayBlocks.length) > 5 && (
                        <div className={styles.monthMore}>
                          +{(dayEvents.length + dayBlocks.length) - 5} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className={styles.scheduler}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <h2>Schedule</h2>
          <div className={styles.viewToggle}>
            <button 
              className={viewType === 'day' ? styles.active : ''} 
              onClick={() => setViewType('day')}
            >
              Day
            </button>
            <button 
              className={viewType === 'week' ? styles.active : ''} 
              onClick={() => setViewType('week')}
            >
              Week
            </button>
            <button 
              className={viewType === 'month' ? styles.active : ''} 
              onClick={() => setViewType('month')}
            >
              Month
            </button>
          </div>
        </div>
        
        <div className={styles.navigation}>
          <button onClick={() => navigateDate(-1)}>←</button>
          <span className={styles.currentDate}>
            {viewType === 'month' 
              ? format(currentDate, 'MMMM yyyy')
              : viewType === 'week'
              ? `${format(startOfWeek(currentDate), 'MMM d')} - ${format(addDays(startOfWeek(currentDate), 6), 'MMM d, yyyy')}`
              : format(currentDate, 'EEEE, MMMM d, yyyy')
            }
          </span>
          <button onClick={() => navigateDate(1)}>→</button>
          <button onClick={() => setCurrentDate(new Date())} className={styles.todayButton}>
            Today
          </button>
        </div>
      </div>
      
      {viewType === 'month' ? <MonthView /> : <WeekDayView />}
      
      {(selectedEvent || selectedTimeBlock) && (
        <EventModal 
          event={selectedEvent}
          timeBlock={selectedTimeBlock}
          courses={courses}
          onClose={() => {
            setSelectedEvent(null);
            setSelectedTimeBlock(null);
          }}
        />
      )}
    </div>
  );
};

export default SchedulerView;