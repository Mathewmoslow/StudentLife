import React from 'react';
import { useScheduleStore } from '../../stores/useScheduleStore';
import CourseManager from './CourseManager';
import PreferencesForm from './PreferencesForm';
import styles from './Settings.module.css';

const Settings: React.FC = () => {
  return (
    <div className={styles.settings}>
      <h1>Settings</h1>
      
      <div className={styles.sections}>
        <section className={styles.section}>
          <h2>Study Preferences</h2>
          <PreferencesForm />
        </section>
        
        <section className={styles.section}>
          <h2>Courses</h2>
          <CourseManager />
        </section>
        
        <section className={styles.section}>
          <h2>Import & Export</h2>
          <div className={styles.importExport}>
            <button className={styles.button}>Import Schedule (CSV)</button>
            <button className={styles.button}>Export Tasks</button>
            <button className={styles.button}>Sync with Google Calendar</button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;
