import React from 'react';
import { useScheduleStore } from '../../stores/useScheduleStore';
import styles from './PreferencesForm.module.css';

const PreferencesForm: React.FC = () => {
  const { preferences, updatePreferences } = useScheduleStore();
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Study session settings
    const studySessionDuration = Number(formData.get('studySessionDuration'));
    const breakDuration = Number(formData.get('breakDuration'));
    const maxDailyStudyHours = Number(formData.get('maxDailyStudyHours'));
    const hoursPerWorkDay = Number(formData.get('hoursPerWorkDay'));
    
    // Time preferences
    const preferredStudyTimes = {
      morning: formData.get('morning') === 'on',
      afternoon: formData.get('afternoon') === 'on',
      evening: formData.get('evening') === 'on',
      night: formData.get('night') === 'on',
    };
    
    // Buffer days
    const daysBeforeExam = Number(formData.get('daysBeforeExam'));
    const daysBeforeAssignment = Number(formData.get('daysBeforeAssignment'));
    const daysBeforeProject = Number(formData.get('daysBeforeProject'));
    const daysBeforeReading = Number(formData.get('daysBeforeReading'));
    const daysBeforeLab = Number(formData.get('daysBeforeLab'));
    
    // Default hours per type
    const defaultHoursPerType = {
      assignment: Number(formData.get('hoursAssignment')),
      exam: Number(formData.get('hoursExam')),
      project: Number(formData.get('hoursProject')),
      reading: Number(formData.get('hoursReading')),
      lab: Number(formData.get('hoursLab')),
    };
    
    // Complexity multipliers
    const complexityMultipliers = {
      1: Number(formData.get('complexity1')),
      2: Number(formData.get('complexity2')),
      3: Number(formData.get('complexity3')),
      4: Number(formData.get('complexity4')),
      5: Number(formData.get('complexity5')),
    };
    
    updatePreferences({
      studySessionDuration,
      breakDuration,
      maxDailyStudyHours,
      hoursPerWorkDay,
      preferredStudyTimes,
      daysBeforeExam,
      daysBeforeAssignment,
      daysBeforeProject,
      daysBeforeReading,
      daysBeforeLab,
      defaultHoursPerType,
      complexityMultipliers,
    });
    
    alert('Preferences saved! Tasks will be rescheduled automatically.');
  };
  
  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {/* Study Session Settings */}
      <div className={styles.section}>
        <h3>Study Session Settings</h3>
        
        <div className={styles.formGroup}>
          <label>Study Session Duration (minutes)</label>
          <input 
            type="number" 
            name="studySessionDuration" 
            min="30" 
            max="240" 
            step="15"
            defaultValue={preferences.studySessionDuration || 120}
            placeholder="120"
          />
          <small>Length of each focused study session before taking a break. Pomodoro technique typically uses 25 min, but 90-120 min works well for deep work.</small>
        </div>
        
        <div className={styles.formGroup}>
          <label>Break Duration (minutes)</label>
          <input 
            type="number" 
            name="breakDuration" 
            min="5" 
            max="60" 
            step="5"
            defaultValue={preferences.breakDuration || 15}
            placeholder="15"
          />
          <small>How long to rest between study sessions. Short breaks help maintain focus - 10-15 min is ideal for mental recovery.</small>
        </div>
        
        <div className={styles.formGroup}>
          <label>Max Daily Study Hours</label>
          <input 
            type="number" 
            name="maxDailyStudyHours" 
            min="1" 
            max="16" 
            step="0.5"
            defaultValue={preferences.maxDailyStudyHours || 8}
            placeholder="8"
          />
          <small>Upper limit of study hours per day to prevent burnout. The scheduler won't assign more than this, even if deadlines are tight.</small>
        </div>
        
        <div className={styles.formGroup}>
          <label>Available Study Hours Per Day</label>
          <input 
            type="number" 
            name="hoursPerWorkDay" 
            min="0.5" 
            max="8" 
            step="0.5"
            defaultValue={preferences.hoursPerWorkDay || 3}
            placeholder="3"
          />
          <small>Your realistic daily study capacity. If a 12-hour project is due in 5 days and you have 3 hours/day available, the scheduler knows to start 4 days early. This prevents last-minute cramming.</small>
        </div>
      </div>
      
      {/* Time Preferences */}
      <div className={styles.section}>
        <h3>Preferred Study Times</h3>
        <p className={styles.sectionDescription}>
          When do you study best? The scheduler will prioritize these time slots when creating your study blocks. 
          Check multiple options if you're flexible. This helps align your schedule with your natural energy levels.
        </p>
        <div className={styles.checkboxGrid}>
          <label className={styles.checkboxLabel}>
            <input 
              type="checkbox" 
              name="morning" 
              defaultChecked={preferences.preferredStudyTimes?.morning || false}
            />
            Morning (6 AM - 12 PM)
          </label>
          <label className={styles.checkboxLabel}>
            <input 
              type="checkbox" 
              name="afternoon" 
              defaultChecked={preferences.preferredStudyTimes?.afternoon || true}
            />
            Afternoon (12 PM - 6 PM)
          </label>
          <label className={styles.checkboxLabel}>
            <input 
              type="checkbox" 
              name="evening" 
              defaultChecked={preferences.preferredStudyTimes?.evening || true}
            />
            Evening (6 PM - 10 PM)
          </label>
          <label className={styles.checkboxLabel}>
            <input 
              type="checkbox" 
              name="night" 
              defaultChecked={preferences.preferredStudyTimes?.night || false}
            />
            Night (10 PM - 12 AM)
          </label>
        </div>
      </div>
      
      {/* Buffer Days */}
      <div className={styles.section}>
        <h3>Buffer Days</h3>
        <p className={styles.sectionDescription}>
          How many days before the deadline you want to complete each type of task. This gives you cushion for review, unexpected issues, or other assignments. The scheduler will aim to finish tasks by this buffer date, not the actual due date.
        </p>
        <div className={styles.gridTwo}>
          <div className={styles.formGroup}>
            <label>Exams</label>
            <input 
              type="number" 
              name="daysBeforeExam" 
              min="0" 
              max="14" 
              defaultValue={preferences.daysBeforeExam || 7}
            placeholder="7"
            />
            <small>Finish studying 7 days early for final review & practice</small>
          </div>
          <div className={styles.formGroup}>
            <label>Assignments</label>
            <input 
              type="number" 
              name="daysBeforeAssignment" 
              min="0" 
              max="14" 
              defaultValue={preferences.daysBeforeAssignment || 3}
            placeholder="3"
            />
            <small>Complete 3 days early for revisions & feedback</small>
          </div>
          <div className={styles.formGroup}>
            <label>Projects</label>
            <input 
              type="number" 
              name="daysBeforeProject" 
              min="0" 
              max="21" 
              defaultValue={preferences.daysBeforeProject || 10}
            placeholder="10"
            />
            <small>Large projects need extra buffer for collaboration & polish</small>
          </div>
          <div className={styles.formGroup}>
            <label>Reading</label>
            <input 
              type="number" 
              name="daysBeforeReading" 
              min="0" 
              max="7" 
              defaultValue={preferences.daysBeforeReading || 2}
            placeholder="2"
            />
            <small>Usually quicker - 2 days allows for note-taking</small>
          </div>
          <div className={styles.formGroup}>
            <label>Lab Work</label>
            <input 
              type="number" 
              name="daysBeforeLab" 
              min="0" 
              max="14" 
              defaultValue={preferences.daysBeforeLab || 3}
            placeholder="3"
            />
            <small>Time to complete lab report & data analysis</small>
          </div>
        </div>
      </div>
      
      {/* Default Hours Per Type */}
      <div className={styles.section}>
        <h3>Default Hours by Task Type (Base Time)</h3>
        <p className={styles.sectionDescription}>
          Standard time needed for each task type assuming normal difficulty (⭐⭐⭐). These are the baseline estimates before any complexity adjustments. 
          When you mark something as harder (⭐⭐⭐⭐) or easier (⭐⭐), the time adjusts accordingly.
        </p>
        <div className={styles.gridTwo}>
          <div className={styles.formGroup}>
            <label>Assignment</label>
            <input 
              type="number" 
              name="hoursAssignment" 
              min="0.5" 
              max="20" 
              step="0.5"
              defaultValue={preferences.defaultHoursPerType?.assignment || 3}
              placeholder="3"
            />
            <small>Typical homework or problem sets (3 hrs default)</small>
          </div>
          <div className={styles.formGroup}>
            <label>Exam Study</label>
            <input 
              type="number" 
              name="hoursExam" 
              min="1" 
              max="40" 
              step="0.5"
              defaultValue={preferences.defaultHoursPerType?.exam || 8}
              placeholder="8"
            />
            <small>Total study time for exam prep (8 hrs default)</small>
          </div>
          <div className={styles.formGroup}>
            <label>Project</label>
            <input 
              type="number" 
              name="hoursProject" 
              min="1" 
              max="100" 
              step="0.5"
              defaultValue={preferences.defaultHoursPerType?.project || 10}
              placeholder="10"
            />
            <small>Major projects or papers (10 hrs default)</small>
          </div>
          <div className={styles.formGroup}>
            <label>Reading</label>
            <input 
              type="number" 
              name="hoursReading" 
              min="0.5" 
              max="10" 
              step="0.5"
              defaultValue={preferences.defaultHoursPerType?.reading || 2}
              placeholder="2"
            />
            <small>Chapter readings or articles (2 hrs default)</small>
          </div>
          <div className={styles.formGroup}>
            <label>Lab Work</label>
            <input 
              type="number" 
              name="hoursLab" 
              min="0.5" 
              max="20" 
              step="0.5"
              defaultValue={preferences.defaultHoursPerType?.lab || 4}
              placeholder="4"
            />
            <small>Lab experiments & reports (4 hrs default)</small>
          </div>
        </div>
      </div>
      
      {/* Complexity Multipliers */}
      <div className={styles.section}>
        <h3>Difficulty Adjustments (Star Ratings)</h3>
        <p className={styles.sectionDescription}>
          When you rate a task's difficulty with stars, these multipliers adjust the time estimate. ⭐⭐⭐ (3 stars) = normal difficulty = no adjustment.
          More stars = more time needed (complex concepts, many steps, or unfamiliar material). 
          Fewer stars = less time needed (review, familiar topics, or simple tasks).
        </p>
        <div className={styles.gridFive}>
          <div className={styles.formGroup}>
            <label>⭐ Very Easy</label>
            <input 
              type="number" 
              name="complexity1" 
              min="0.1" 
              max="3" 
              step="0.1"
              defaultValue={preferences.complexityMultipliers?.[1] || 0.5}
              placeholder="0.5"
            />
            <small>Quick review or very familiar (−50% time)</small>
          </div>
          <div className={styles.formGroup}>
            <label>⭐⭐ Easy</label>
            <input 
              type="number" 
              name="complexity2" 
              min="0.1" 
              max="3" 
              step="0.1"
              defaultValue={preferences.complexityMultipliers?.[2] || 0.75}
              placeholder="0.75"
            />
            <small>Somewhat familiar material (−25% time)</small>
          </div>
          <div className={styles.formGroup}>
            <label>⭐⭐⭐ Medium</label>
            <input 
              type="number" 
              name="complexity3" 
              min="0.1" 
              max="3" 
              step="0.1"
              defaultValue={preferences.complexityMultipliers?.[3] || 1.0}
              placeholder="1.0"
            />
            <small>Standard difficulty (no adjustment)</small>
          </div>
          <div className={styles.formGroup}>
            <label>⭐⭐⭐⭐ Hard</label>
            <input 
              type="number" 
              name="complexity4" 
              min="0.1" 
              max="5" 
              step="0.1"
              defaultValue={preferences.complexityMultipliers?.[4] || 1.5}
              placeholder="1.5"
            />
            <small>Complex or unfamiliar (+50% time)</small>
          </div>
          <div className={styles.formGroup}>
            <label>⭐⭐⭐⭐⭐ Very Hard</label>
            <input 
              type="number" 
              name="complexity5" 
              min="0.1" 
              max="5" 
              step="0.1"
              defaultValue={preferences.complexityMultipliers?.[5] || 2.0}
              placeholder="2.0"
            />
            <small>Very complex, many parts (+100% time)</small>
          </div>
        </div>
      </div>
      
      <button type="submit" className={styles.saveButton}>
        Save All Preferences
      </button>
    </form>
  );
};

export default PreferencesForm;