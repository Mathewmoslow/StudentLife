import React from 'react';
import { NavLink } from 'react-router-dom';
import GlobalSearch from '../search/GlobalSearch';
import { useScheduleStore } from '../../stores/useScheduleStore';
import styles from './Navigation.module.css';

const Navigation: React.FC = () => {
  const { courses, tasks } = useScheduleStore();
  const hasCourses = courses.length > 0;
  const isEmpty = courses.length === 0 && tasks.length === 0;

  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>
        <span className={styles.logoIcon}>📚</span>
        <span className={styles.logoText}>StudentLife</span>
      </div>
      
      <div className={styles.searchWrapper}>
        <GlobalSearch />
      </div>
      
      <ul className={styles.navList}>
        <li>
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => isActive ? styles.active : ''}
          >
            Dashboard
          </NavLink>
        </li>
        {isEmpty && (
          <li>
            <NavLink 
              to="/canvas-import" 
              className={styles.importHighlight}
            >
              <span style={{ marginRight: '4px' }}>🚀</span>
              Import Courses
            </NavLink>
          </li>
        )}
        <li>
          <NavLink 
            to="/timeline" 
            className={({ isActive }) => isActive ? styles.active : ''}
          >
            Timeline
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/schedule" 
            className={({ isActive }) => isActive ? styles.active : ''}
          >
            Schedule
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/tasks" 
            className={({ isActive }) => isActive ? styles.active : ''}
          >
            Tasks
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/settings" 
            className={({ isActive }) => isActive ? styles.active : ''}
          >
            Settings
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;
