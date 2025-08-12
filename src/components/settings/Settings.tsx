import React, { useState } from 'react';
import { useScheduleStore } from '../../stores/useScheduleStore';
import { DataLoader } from '../../services/dataLoader';
import { safeStorage } from '../../utils/safeStorage';
import CourseManager from './CourseManager';
import ImportModal from './ImportModal';
import NotificationSettings from './NotificationSettings';
import PreferencesForm from './PreferencesForm';
import styles from './Settings.module.css';

const Settings: React.FC = () => {
  const [dataLoaded, setDataLoaded] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  
  const handleLoadSampleData = () => {
    try {
      DataLoader.loadNursingData();
      setDataLoaded(true);
      alert('Sample nursing data loaded successfully!');
    } catch (error) {
      console.error('Error loading sample data:', error);
      alert('Failed to load sample data');
    }
  };
  
  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      safeStorage.clear();
      window.location.reload();
    }
  };
  
  return (
    <div className={styles.settings}>
      <h1>Settings</h1>
      
      <div className={styles.sections}>
        <section className={styles.section}>
          <h2>Courses</h2>
          <CourseManager />
        </section>
        
        <section className={styles.section}>
          <h2>Preferences</h2>
          <PreferencesForm />
        </section>
        
        <section className={styles.section}>
          <h2>Notifications</h2>
          <NotificationSettings />
        </section>
        
        <section className={styles.section}>
          <h2>Import & Export</h2>
          <div className={styles.importExport}>
            <button 
              className={styles.button}
              onClick={() => setShowImportModal(true)}
            >
              📝 Import from Text/Syllabus
            </button>
            <button className={styles.button} disabled>Export Tasks (Coming Soon)</button>
            <button className={styles.button} disabled>Sync with Google Calendar (Coming Soon)</button>
          </div>
          <p className={styles.helpText}>
            Import tasks from any text source - just copy and paste!
          </p>
        </section>
        
        <section className={styles.section}>
          <h2>Sample Data & Testing</h2>
          <div className={styles.importExport}>
            <button 
              className={styles.button}
              onClick={handleLoadSampleData}
              disabled={dataLoaded}
            >
              {dataLoaded ? '✅ Sample Data Loaded' : '📚 Load Nursing Sample Data'}
            </button>
            <button 
              className={styles.button}
              onClick={handleClearAllData}
              style={{ backgroundColor: '#dc2626' }}
            >
              🗑️ Clear All Data
            </button>
          </div>
          <p className={styles.helpText}>
            Use sample data to test the app with a pre-configured nursing student schedule.
          </p>
        </section>
      </div>
      
      {showImportModal && (
        <ImportModal onClose={() => setShowImportModal(false)} />
      )}
    </div>
  );
};

export default Settings;
