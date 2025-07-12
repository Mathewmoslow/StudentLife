import React, { useState, useEffect } from 'react';
import { Calendar, Brain, Clock, Zap, BarChart, RefreshCw, X } from 'lucide-react';
import { useScheduleStore } from '../../stores/useScheduleStore';
import { StudyScheduler } from '../../core/algorithms/studyScheduler';

interface StudySchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const StudySchedulerModal: React.FC<StudySchedulerModalProps> = ({ isOpen, onClose }) => {
  const { tasks, courses, events, timeBlocks, addTimeBlock } = useScheduleStore();
  const [scheduler] = useState(() => new StudyScheduler());
  const [preferences, setPreferences] = useState({
    dailyMaxHours: 6,
    weekendMaxHours: 4,
    blockDuration: 1.5,
    morningWeight: 1,
    afternoonWeight: 1,
    eveningWeight: 1,
    energyMonday: 90,
    energyTuesday: 100,
    energyWednesday: 95,
    energyThursday: 85,
    energyFriday: 70,
    energySaturday: 80,
    energySunday: 90
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [statistics, setStatistics] = useState<any>(null);

  // Update scheduler preferences when UI preferences change
  useEffect(() => {
    scheduler.updatePreferences({
      dailyMaxHours: preferences.dailyMaxHours,
      weekendMaxHours: preferences.weekendMaxHours,
      blockDuration: preferences.blockDuration,
      preferredTimes: {
        morning: { start: 8, end: 12, weight: preferences.morningWeight },
        afternoon: { start: 13, end: 17, weight: preferences.afternoonWeight },
        evening: { start: 18, end: 22, weight: preferences.eveningWeight }
      },
      energyLevels: {
        monday: preferences.energyMonday / 100,
        tuesday: preferences.energyTuesday / 100,
        wednesday: preferences.energyWednesday / 100,
        thursday: preferences.energyThursday / 100,
        friday: preferences.energyFriday / 100,
        saturday: preferences.energySaturday / 100,
        sunday: preferences.energySunday / 100
      }
    });
  }, [preferences, scheduler]);

  if (!isOpen) return null;

  const generateSchedule = () => {
    setIsGenerating(true);
    
    // Get incomplete tasks and ensure scheduledBlocks types are correct
    const incompleteTasks = tasks
      .filter(t => t.status !== 'completed')
      .map(task => ({
        ...task,
        scheduledBlocks: task.scheduledBlocks?.map(tb => ({
          ...tb,
          type: tb.type as "study" | "review" | "work"
        })) ?? []
      }));
    
    // Set date range
    const startDate = new Date();
    const endDate = new Date('2025-08-10'); // End of semester
    
    // Combine events and existing time blocks for scheduling
    const existingEvents = [
      ...events.map(e => ({
        id: e.id,
        start: e.startTime,
        end: e.endTime,
        type: e.type
      })),
      ...timeBlocks.map(tb => ({
        id: tb.id,
        start: tb.startTime,
        end: tb.endTime,
        type: 'study'
      }))
    ];
    
    // Generate schedule
    const studyBlocks = scheduler.generateSchedule(
      incompleteTasks,
      courses,
      existingEvents,
      startDate,
      endDate
    );
    
    // Get statistics
    const stats = scheduler.getStatistics();
    setStatistics(stats);
    
    // Add generated study blocks to store
    const calendarBlocks = scheduler.exportForCalendar();
    calendarBlocks.forEach(block => {
      addTimeBlock({
        taskId: block.extendedProps.taskId,
        startTime: new Date(block.start),
        endTime: new Date(block.end),
        completed: false,
        type: block.extendedProps.type || 'study',
        isManual: false
      });
    });
    
    setIsGenerating(false);
    onClose();
  };

  const handlePreferenceChange = (key: string, value: string) => {
    setPreferences(prev => ({
      ...prev,
      [key]: parseFloat(value) || 0
    }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header" style={{ 
          backgroundColor: '#6366f1', 
          color: 'white', 
          padding: '1.5rem',
          borderRadius: '0.5rem 0.5rem 0 0'
        }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <Brain size={24} />
            Smart Study Scheduler
          </h2>
          <button 
            onClick={onClose} 
            style={{ 
              background: 'rgba(255,255,255,0.2)', 
              border: 'none', 
              borderRadius: '50%', 
              width: '32px', 
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white'
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '1.5rem' }}>
          {/* Time Preferences */}
          <div className="preference-section" style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Clock size={16} />
              Time Limits
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                  Daily Max Hours
                </label>
                <input
                  type="number"
                  value={preferences.dailyMaxHours}
                  onChange={(e) => handlePreferenceChange('dailyMaxHours', e.target.value)}
                  min="1"
                  max="12"
                  step="0.5"
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #e5e7eb' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                  Weekend Max Hours
                </label>
                <input
                  type="number"
                  value={preferences.weekendMaxHours}
                  onChange={(e) => handlePreferenceChange('weekendMaxHours', e.target.value)}
                  min="1"
                  max="8"
                  step="0.5"
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #e5e7eb' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                  Block Duration (hrs)
                </label>
                <input
                  type="number"
                  value={preferences.blockDuration}
                  onChange={(e) => handlePreferenceChange('blockDuration', e.target.value)}
                  min="0.5"
                  max="3"
                  step="0.5"
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #e5e7eb' }}
                />
              </div>
            </div>
          </div>

          {/* Time of Day Preferences */}
          <div className="preference-section" style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ marginBottom: '1rem' }}>Preferred Study Times</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { key: 'morningWeight', label: 'Morning (8AM-12PM)' },
                { key: 'afternoonWeight', label: 'Afternoon (1PM-5PM)' },
                { key: 'eveningWeight', label: 'Evening (6PM-10PM)' }
              ].map(({ key, label }) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <label style={{ flex: '0 0 150px', fontSize: '0.875rem' }}>{label}</label>
                  <input
                    type="range"
                    value={preferences[key]}
                    onChange={(e) => handlePreferenceChange(key, e.target.value)}
                    min="0"
                    max="2"
                    step="0.1"
                    style={{ flex: 1 }}
                  />
                  <span style={{ flex: '0 0 50px', textAlign: 'right', fontSize: '0.875rem' }}>
                    {(preferences[key] * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Energy Levels */}
          <div className="preference-section" style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Zap size={16} />
              Daily Energy Levels
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                <div key={day} style={{ textAlign: 'center' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                    {day.slice(0, 3)}
                  </label>
                  <input
                    type="range"
                    value={preferences[`energy${day}`]}
                    onChange={(e) => handlePreferenceChange(`energy${day}`, e.target.value)}
                    min="0"
                    max="100"
                    step="5"
                    style={{ width: '100%' }}
                  />
                  <span style={{ display: 'block', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    {preferences[`energy${day}`]}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Statistics */}
          {statistics && (
            <div style={{ 
              background: '#f3f4f6', 
              padding: '1rem', 
              borderRadius: '0.5rem',
              marginBottom: '1.5rem'
            }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <BarChart size={16} />
                Schedule Preview
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#6366f1' }}>
                    {statistics.totalHours.toFixed(1)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Total Hours</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#6366f1' }}>
                    {statistics.blockCount}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Study Blocks</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#6366f1' }}>
                    {statistics.averagePerDay.toFixed(1)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Avg hrs/day</div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button 
              onClick={onClose}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                border: '1px solid #e5e7eb',
                background: 'white',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button 
              onClick={generateSchedule}
              disabled={isGenerating || tasks.length === 0}
              style={{
                padding: '0.5rem 1.5rem',
                borderRadius: '0.375rem',
                border: 'none',
                background: isGenerating ? '#9ca3af' : '#6366f1',
                color: 'white',
                cursor: isGenerating ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {isGenerating ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Calendar size={16} />
                  Generate Study Schedule
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudySchedulerModal;