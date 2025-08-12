import React, { useState, useEffect, useCallback } from 'react';
import { useScheduleStore } from '../../stores/useScheduleStore';
import { studyTimerService, StudySession } from '../../services/studyTimerService';
import { Task } from '../../types';
import styles from './StudyTimer.module.css';

const StudyTimer: React.FC = () => {
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerState, setTimerState] = useState<'idle' | 'studying' | 'break' | 'paused'>('idle');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskSelector, setShowTaskSelector] = useState(false);
  const [showSessionEnd, setShowSessionEnd] = useState(false);
  const [productivity, setProductivity] = useState(3);
  const [notes, setNotes] = useState('');
  
  const { tasks, updateTask } = useScheduleStore();
  
  // Filter tasks that need work
  const activeTasks = tasks.filter(t => 
    t.status !== 'completed' && 
    t.estimatedHours > 0
  );

  useEffect(() => {
    // Subscribe to timer updates
    const unsubscribeTick = studyTimerService.onTick((time) => {
      setElapsedTime(time);
    });
    
    const unsubscribeState = studyTimerService.onStateChange((state) => {
      setTimerState(state);
    });
    
    // Check if there's an active session
    const session = studyTimerService.getCurrentSession();
    if (session) {
      setCurrentSession(session);
      setElapsedTime(studyTimerService.getElapsedTime());
      const task = tasks.find(t => t.id === session.taskId);
      if (task) setSelectedTask(task);
    }
    
    return () => {
      unsubscribeTick();
      unsubscribeState();
    };
  }, [tasks]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartSession = () => {
    if (!selectedTask) {
      setShowTaskSelector(true);
      return;
    }
    
    const session = studyTimerService.startSession(selectedTask);
    setCurrentSession(session);
    setShowTaskSelector(false);
  };

  const handleEndSession = () => {
    setShowSessionEnd(true);
  };

  const confirmEndSession = () => {
    const session = studyTimerService.endSession(productivity, notes);
    
    if (session && selectedTask) {
      // Update task progress
      const actualHours = (session.duration || 0) / 60;
      updateTask(selectedTask.id, {
        progress: Math.min(100, (selectedTask.progress || 0) + (actualHours / selectedTask.estimatedHours * 100))
      });
    }
    
    setCurrentSession(null);
    setSelectedTask(null);
    setElapsedTime(0);
    setShowSessionEnd(false);
    setProductivity(3);
    setNotes('');
  };

  const handlePauseResume = () => {
    studyTimerService.togglePause();
  };

  const handleStartBreak = (isLong: boolean = false) => {
    studyTimerService.startBreak(isLong);
  };

  const handleTaskSelect = (task: Task) => {
    setSelectedTask(task);
    setShowTaskSelector(false);
    handleStartSession();
  };

  const getProgressPercentage = (): number => {
    const settings = studyTimerService.getSettings();
    const targetSeconds = settings.sessionDuration * 60;
    return Math.min(100, (elapsedTime / targetSeconds) * 100);
  };

  return (
    <div className={styles.studyTimer}>
      <div className={styles.timerCard}>
        <div className={styles.timerHeader}>
          <h2>Study Timer</h2>
          {timerState !== 'idle' && (
            <span className={styles.state}>{timerState}</span>
          )}
        </div>

        {/* Timer Display */}
        <div className={styles.timerDisplay}>
          <div className={styles.timeCircle}>
            <svg className={styles.progressRing} width="200" height="200">
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="#e0e0e0"
                strokeWidth="8"
              />
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke={timerState === 'break' ? '#4CAF50' : '#2196F3'}
                strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 90}`}
                strokeDashoffset={`${2 * Math.PI * 90 * (1 - getProgressPercentage() / 100)}`}
                transform="rotate(-90 100 100)"
                className={styles.progressCircle}
              />
            </svg>
            <div className={styles.timeText}>
              {formatTime(elapsedTime)}
            </div>
          </div>
        </div>

        {/* Current Task */}
        {selectedTask && (
          <div className={styles.currentTask}>
            <h3>Working on:</h3>
            <p>{selectedTask.title}</p>
            <div className={styles.taskProgress}>
              <div 
                className={styles.taskProgressBar}
                style={{ width: `${selectedTask.progress || 0}%` }}
              />
            </div>
          </div>
        )}

        {/* Controls */}
        <div className={styles.controls}>
          {timerState === 'idle' && (
            <>
              <button 
                className={styles.primaryButton}
                onClick={handleStartSession}
              >
                {selectedTask ? 'Start Session' : 'Select Task & Start'}
              </button>
            </>
          )}
          
          {(timerState === 'studying' || timerState === 'paused') && (
            <>
              <button 
                className={styles.secondaryButton}
                onClick={handlePauseResume}
              >
                {timerState === 'paused' ? 'Resume' : 'Pause'}
              </button>
              <button 
                className={styles.breakButton}
                onClick={() => handleStartBreak(false)}
              >
                Short Break
              </button>
              <button 
                className={styles.breakButton}
                onClick={() => handleStartBreak(true)}
              >
                Long Break
              </button>
              <button 
                className={styles.dangerButton}
                onClick={handleEndSession}
              >
                End Session
              </button>
            </>
          )}
          
          {timerState === 'break' && (
            <div className={styles.breakMessage}>
              Enjoy your break! Timer will notify you when it's time to continue.
            </div>
          )}
        </div>
      </div>

      {/* Task Selector Modal */}
      {showTaskSelector && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Select a Task</h3>
            <div className={styles.taskList}>
              {activeTasks.map(task => (
                <div 
                  key={task.id}
                  className={styles.taskItem}
                  onClick={() => handleTaskSelect(task)}
                >
                  <div className={styles.taskInfo}>
                    <h4>{task.title}</h4>
                    <p>Est. {task.estimatedHours}h • Due {new Date(task.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div className={styles.taskProgress}>
                    <div 
                      className={styles.progressFill}
                      style={{ width: `${task.progress || 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button 
              className={styles.cancelButton}
              onClick={() => setShowTaskSelector(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Session End Modal */}
      {showSessionEnd && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>End Study Session</h3>
            
            <div className={styles.formGroup}>
              <label>How productive was this session?</label>
              <div className={styles.productivityRating}>
                {[1, 2, 3, 4, 5].map(rating => (
                  <button
                    key={rating}
                    className={`${styles.ratingButton} ${productivity === rating ? styles.selected : ''}`}
                    onClick={() => setProductivity(rating)}
                  >
                    {rating}
                  </button>
                ))}
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label>Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any thoughts on this session?"
                rows={3}
              />
            </div>
            
            <div className={styles.modalActions}>
              <button 
                className={styles.primaryButton}
                onClick={confirmEndSession}
              >
                End Session
              </button>
              <button 
                className={styles.cancelButton}
                onClick={() => setShowSessionEnd(false)}
              >
                Continue Studying
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyTimer;