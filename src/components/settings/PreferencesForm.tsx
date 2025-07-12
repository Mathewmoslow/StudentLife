import React from 'react';
import { useScheduleStore } from '../../stores/useScheduleStore';
import styles from './PreferencesForm.module.css';

const PreferencesForm: React.FC = () => {
  const { preferences, updatePreferences } = useScheduleStore();
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    updatePreferences({
      studyHours: {
        start: formData.get('studyStart') as string,
        end: formData.get('studyEnd') as string
      },
      breakDuration: Number(formData.get('breakDuration')),
      sessionDuration: Number(formData.get('sessionDuration')),
      bufferDefaults: {
        soft: Number(formData.get('softBuffer')),
        hard: Number(formData.get('hardBuffer'))
      }
    });
  };
  
  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGroup}>
        <label>Study Hours</label>
        <div className={styles.timeRange}>
          <input 
            type="time" 
            name="studyStart" 
            defaultValue={preferences.studyHours.start}
          />
          <span>to</span>
          <input 
            type="time" 
            name="studyEnd" 
            defaultValue={preferences.studyHours.end}
          />
        </div>
      </div>
      
      <div className={styles.formGroup}>
        <label>Session Duration (minutes)</label>
        <input 
          type="number" 
          name="sessionDuration" 
          min="30" 
          max="180" 
          defaultValue={preferences.sessionDuration}
        />
      </div>
      
      <div className={styles.formGroup}>
        <label>Break Duration (minutes)</label>
        <input 
          type="number" 
          name="breakDuration" 
          min="5" 
          max="60" 
          defaultValue={preferences.breakDuration}
        />
      </div>
      
      <div className={styles.formGroup}>
        <label>Default Buffer Time</label>
        <div className={styles.bufferInputs}>
          <div>
            <label>Soft Deadlines</label>
            <input 
              type="number" 
              name="softBuffer" 
              min="0" 
              max="100" 
              defaultValue={preferences.bufferDefaults.soft}
            />
            <span>%</span>
          </div>
          <div>
            <label>Hard Deadlines</label>
            <input 
              type="number" 
              name="hardBuffer" 
              min="0" 
              max="50" 
              defaultValue={preferences.bufferDefaults.hard}
            />
            <span>%</span>
          </div>
        </div>
      </div>
      
      <button type="submit" className={styles.saveButton}>
        Save Preferences
      </button>
    </form>
  );
};

export default PreferencesForm;
