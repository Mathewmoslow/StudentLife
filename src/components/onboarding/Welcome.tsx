import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScheduleStore } from '../../stores/useScheduleStore';
import styles from './Welcome.module.css';

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const { tasks, courses } = useScheduleStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('hasSeenWelcome');
    if (seen && (tasks.length > 0 || courses.length > 0)) {
      navigate('/dashboard');
    }
    setHasSeenWelcome(!!seen);
  }, [tasks.length, courses.length, navigate]);

  const handleGetStarted = () => {
    localStorage.setItem('hasSeenWelcome', 'true');
    navigate('/canvas-import');
  };

  const handleSkip = () => {
    localStorage.setItem('hasSeenWelcome', 'true');
    navigate('/dashboard');
  };

  return (
    <div className={styles.welcomeContainer}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Welcome to StudentLife</h1>
        <p className={styles.subtitle}>
          Your AI-powered academic assistant that transforms Canvas chaos into clarity
        </p>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.problemSection}>
          <h2>We Know Your Struggle</h2>
          <div className={styles.painPoints}>
            <div className={styles.painPoint}>
              <span className={styles.emoji}>😵</span>
              <p>Lost in Canvas with assignments scattered everywhere?</p>
            </div>
            <div className={styles.painPoint}>
              <span className={styles.emoji}>📚</span>
              <p>Can't make sense of complex syllabi and course schedules?</p>
            </div>
            <div className={styles.painPoint}>
              <span className={styles.emoji}>⏰</span>
              <p>Missing deadlines because everything's in different places?</p>
            </div>
          </div>
        </div>

        <div className={styles.solutionSection}>
          <h2>Here's How StudentLife Helps</h2>
          <div className={styles.steps}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h3>Import Your Courses</h3>
                <p>Connect to Canvas or paste your course information directly</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h3>Load Your Syllabi</h3>
                <p>Our AI extracts all assignments, exams, and deadlines automatically</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h3>Get Your Schedule</h3>
                <p>See everything in one place with smart time management suggestions</p>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.ctaSection}>
          <button onClick={handleGetStarted} className={styles.primaryButton}>
            🚀 Get Started - Import from Canvas
          </button>
          <button onClick={handleSkip} className={styles.secondaryButton}>
            Skip for now - I'll explore first
          </button>
        </div>

        <div className={styles.features}>
          <h3>What you'll get:</h3>
          <ul>
            <li>✅ All assignments from all courses in one timeline</li>
            <li>✅ Smart AI parsing of complex syllabi</li>
            <li>✅ Automatic study session scheduling</li>
            <li>✅ Never miss another deadline</li>
            <li>✅ Focus timer with break reminders</li>
            <li>✅ 3D visualization of your workload</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Welcome;