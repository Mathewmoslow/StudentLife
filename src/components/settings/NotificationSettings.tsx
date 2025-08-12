import React, { useState, useEffect } from 'react';
import { notificationService, NotificationSettings as NotificationSettingsType } from '../../services/notificationService';
import styles from './Settings.module.css';

const NotificationSettings: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSettingsType>(
    notificationService.getSettings()
  );
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(
    notificationService.getPermissionStatus()
  );

  useEffect(() => {
    // Check permission status on mount
    setPermissionStatus(notificationService.getPermissionStatus());
  }, []);

  const handleRequestPermission = async () => {
    const granted = await notificationService.requestPermission();
    if (granted) {
      setPermissionStatus('granted');
      notificationService.testNotification();
    }
  };

  const handleSettingChange = (key: keyof NotificationSettingsType, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    notificationService.updateSettings(newSettings);
  };

  const handleReminderTimeChange = (index: number, value: string) => {
    const minutes = parseInt(value, 10);
    if (!isNaN(minutes)) {
      const newTimes = [...settings.reminderTimes];
      newTimes[index] = minutes;
      handleSettingChange('reminderTimes', newTimes);
    }
  };

  const addReminderTime = () => {
    const newTimes = [...settings.reminderTimes, 30];
    handleSettingChange('reminderTimes', newTimes);
  };

  const removeReminderTime = (index: number) => {
    const newTimes = settings.reminderTimes.filter((_, i) => i !== index);
    handleSettingChange('reminderTimes', newTimes);
  };

  const formatMinutes = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(minutes / 1440);
      return `${days} day${days > 1 ? 's' : ''}`;
    }
  };

  return (
    <div className={styles.notificationSettings}>
      <h3>📬 Notification Settings</h3>
      
      {permissionStatus !== 'granted' && (
        <div className={styles.permissionBanner}>
          <p>🔔 Enable browser notifications to receive reminders for your tasks and deadlines.</p>
          <button 
            className={styles.button}
            onClick={handleRequestPermission}
            disabled={permissionStatus === 'denied'}
          >
            {permissionStatus === 'denied' 
              ? '❌ Notifications Blocked (Check browser settings)'
              : '🔔 Enable Notifications'}
          </button>
        </div>
      )}

      {permissionStatus === 'granted' && (
        <>
          <div className={styles.settingGroup}>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => handleSettingChange('enabled', e.target.checked)}
              />
              <span>Enable All Notifications</span>
            </label>
          </div>

          <div className={styles.settingGroup}>
            <h4>Notification Types</h4>
            
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={settings.taskReminders}
                onChange={(e) => handleSettingChange('taskReminders', e.target.checked)}
                disabled={!settings.enabled}
              />
              <span>Task Reminders</span>
            </label>

            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={settings.deadlineWarnings}
                onChange={(e) => handleSettingChange('deadlineWarnings', e.target.checked)}
                disabled={!settings.enabled}
              />
              <span>Deadline Warnings</span>
            </label>

            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={settings.studyBlockReminders}
                onChange={(e) => handleSettingChange('studyBlockReminders', e.target.checked)}
                disabled={!settings.enabled}
              />
              <span>Study Block Reminders</span>
            </label>

            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => handleSettingChange('soundEnabled', e.target.checked)}
                disabled={!settings.enabled}
              />
              <span>Play Sound with Notifications</span>
            </label>
          </div>

          <div className={styles.settingGroup}>
            <h4>Reminder Times</h4>
            <p className={styles.helpText}>Get notified before deadlines and study blocks</p>
            
            <div className={styles.reminderTimes}>
              {settings.reminderTimes.map((time, index) => (
                <div key={index} className={styles.reminderTime}>
                  <input
                    type="number"
                    value={time}
                    onChange={(e) => handleReminderTimeChange(index, e.target.value)}
                    min={1}
                    disabled={!settings.enabled}
                    className={styles.timeInput}
                  />
                  <span className={styles.timeLabel}>
                    {formatMinutes(time)} before
                  </span>
                  <button
                    onClick={() => removeReminderTime(index)}
                    disabled={!settings.enabled || settings.reminderTimes.length <= 1}
                    className={styles.removeButton}
                  >
                    ✕
                  </button>
                </div>
              ))}
              
              <button
                onClick={addReminderTime}
                disabled={!settings.enabled}
                className={styles.addButton}
              >
                + Add Reminder Time
              </button>
            </div>
          </div>

          <div className={styles.settingGroup}>
            <button
              onClick={() => notificationService.testNotification()}
              className={styles.button}
              disabled={!settings.enabled}
            >
              🔔 Test Notification
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationSettings;