import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Navigation.module.css';

const Navigation: React.FC = () => {
  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>
        <span className={styles.logoIcon}>📚</span>
        <span className={styles.logoText}>StudentLife</span>
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
