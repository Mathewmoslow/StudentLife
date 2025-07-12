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
            defaultValue={preferences.studySessionDuration}
          />
          <small>How long should each study session be?</small>
        </div>
        
        <div className={styles.formGroup}>
          <label>Break Duration (minutes)</label>
          <input 
            type="number" 
            name="breakDuration" 
            min="5" 
            max="60" 
            step="5"
            defaultValue={preferences.breakDuration}
          />
          <small>Break time between study sessions</small>
        </div>
        
        <div className={styles.formGroup}>
          <label>Max Daily Study Hours</label>
          <input 
            type="number" 
            name="maxDailyStudyHours" 
            min="1" 
            max="16" 
            step="0.5"
            defaultValue={preferences.maxDailyStudyHours}
          />
          <small>Maximum hours you want to study per day</small>
        </div>
        
        <div className={styles.formGroup}>
          <label>Average Work Hours Per Day</label>
          <input 
            type="number" 
            name="hoursPerWorkDay" 
            min="0.5" 
            max="8" 
            step="0.5"
            defaultValue={preferences.hoursPerWorkDay}
          />
          <small>Used to calculate how many days before deadline to start tasks</small>
        </div>
      </div>
      
      {/* Time Preferences */}
      <div className={styles.section}>
        <h3>Preferred Study Times</h3>
        <div className={styles.checkboxGrid}>
          <label className={styles.checkboxLabel}>
            <input 
              type="checkbox" 
              name="morning" 
              defaultChecked={preferences.preferredStudyTimes.morning}
            />
            Morning (6 AM - 12 PM)
          </label>
          <label className={styles.checkboxLabel}>
            <input 
              type="checkbox" 
              name="afternoon" 
              defaultChecked={preferences.preferredStudyTimes.afternoon}
            />
            Afternoon (12 PM - 6 PM)
          </label>
          <label className={styles.checkboxLabel}>
            <input 
              type="checkbox" 
              name="evening" 
              defaultChecked={preferences.preferredStudyTimes.evening}
            />
            Evening (6 PM - 10 PM)
          </label>
          <label className={styles.checkboxLabel}>
            <input 
              type="checkbox" 
              name="night" 
              defaultChecked={preferences.preferredStudyTimes.night}
            />
            Night (10 PM - 12 AM)
          </label>
        </div>
      </div>
      
      {/* Buffer Days */}
      <div className={styles.section}>
        <h3>Buffer Days (Days before deadline to finish)</h3>
        <div className={styles.gridTwo}>
          <div className={styles.formGroup}>
            <label>Exams</label>
            <input 
              type="number" 
              name="daysBeforeExam" 
              min="0" 
              max="14" 
              defaultValue={preferences.daysBeforeExam}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Assignments</label>
            <input 
              type="number" 
              name="daysBeforeAssignment" 
              min="0" 
              max="14" 
              defaultValue={preferences.daysBeforeAssignment}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Projects</label>
            <input 
              type="number" 
              name="daysBeforeProject" 
              min="0" 
              max="21" 
              defaultValue={preferences.daysBeforeProject}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Reading</label>
            <input 
              type="number" 
              name="daysBeforeReading" 
              min="0" 
              max="7" 
              defaultValue={preferences.daysBeforeReading}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Lab Work</label>
            <input 
              type="number" 
              name="daysBeforeLab" 
              min="0" 
              max="14" 
              defaultValue={preferences.daysBeforeLab}
            />
          </div>
        </div>
      </div>
      
      {/* Default Hours Per Type */}
      <div className={styles.section}>
        <h3>Default Hours by Task Type</h3>
        <div className={styles.gridTwo}>
          <div className={styles.formGroup}>
            <label>Assignment (base hours)</label>
            <input 
              type="number" 
              name="hoursAssignment" 
              min="0.5" 
              max="20" 
              step="0.5"
              defaultValue={preferences.defaultHoursPerType.assignment}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Exam Study (hours)</label>
            <input 
              type="number" 
              name="hoursExam" 
              min="1" 
              max="40" 
              step="0.5"
              defaultValue={preferences.defaultHoursPerType.exam}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Project (base hours)</label>
            <input 
              type="number" 
              name="hoursProject" 
              min="1" 
              max="100" 
              step="0.5"
              defaultValue={preferences.defaultHoursPerType.project}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Reading (hours)</label>
            <input 
              type="number" 
              name="hoursReading" 
              min="0.5" 
              max="10" 
              step="0.5"
              defaultValue={preferences.defaultHoursPerType.reading}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Lab Work (hours)</label>
            <input 
              type="number" 
              name="hoursLab" 
              min="0.5" 
              max="20" 
              step="0.5"
              defaultValue={preferences.defaultHoursPerType.lab}
            />
          </div>
        </div>
      </div>
      
      {/* Complexity Multipliers */}
      <div className={styles.section}>
        <h3>Complexity Multipliers</h3>
        <p className={styles.sectionDescription}>
          These multiply the base hours. For example, a "Hard" (4) assignment takes 1.5x the base hours.
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
              defaultValue={preferences.complexityMultipliers[1]}
            />
          </div>
          <div className={styles.formGroup}>
            <label>⭐⭐ Easy</label>
            <input 
              type="number" 
              name="complexity2" 
              min="0.1" 
              max="3" 
              step="0.1"
              defaultValue={preferences.complexityMultipliers[2]}
            />
          </div>
          <div className={styles.formGroup}>
            <label>⭐⭐⭐ Medium</label>
            <input 
              type="number" 
              name="complexity3" 
              min="0.1" 
              max="3" 
              step="0.1"
              defaultValue={preferences.complexityMultipliers[3]}
            />
          </div>
          <div className={styles.formGroup}>
            <label>⭐⭐⭐⭐ Hard</label>
            <input 
              type="number" 
              name="complexity4" 
              min="0.1" 
              max="5" 
              step="0.1"
              defaultValue={preferences.complexityMultipliers[4]}
            />
          </div>
          <div className={styles.formGroup}>
            <label>⭐⭐⭐⭐⭐ Very Hard</label>
            <input 
              type="number" 
              name="complexity5" 
              min="0.1" 
              max="5" 
              step="0.1"
              defaultValue={preferences.complexityMultipliers[5]}
            />
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