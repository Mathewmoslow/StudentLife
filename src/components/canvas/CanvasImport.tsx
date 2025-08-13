import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScheduleStore } from '../../stores/useScheduleStore';
import { parseWithOpenAI } from '../../services/openaiParser';
import { hybridParser } from '../../services/hybridParser';
import { safeStorage } from '../../utils/safeStorage';
import LoadingSpinner from '../common/LoadingSpinner';
import styles from './CanvasImport.module.css';

interface ImportStep {
  id: number;
  title: string;
  completed: boolean;
}

const CanvasImport: React.FC = () => {
  const navigate = useNavigate();
  const { addCourse, addTask, courses } = useScheduleStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [syllabusText, setSyllabusText] = useState('');
  const [courseName, setCourseName] = useState('');
  const [instructorName, setInstructorName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiKey, setApiKey] = useState(safeStorage.getItem('openai_api_key') || '');
  const [error, setError] = useState('');
  const [parsedTasks, setParsedTasks] = useState<any[]>([]);
  const [importedCourses, setImportedCourses] = useState<string[]>([]);
  
  const hasEnvApiKey = !!import.meta.env.VITE_OPENAI_API_KEY;

  const steps: ImportStep[] = [
    { id: 1, title: 'Add Course Info', completed: currentStep > 1 },
    { id: 2, title: 'Paste Syllabus', completed: currentStep > 2 },
    { id: 3, title: 'Review & Import', completed: currentStep > 3 }
  ];

  const handleAddCourse = () => {
    if (!courseName.trim()) {
      setError('Please enter a course name');
      return;
    }

    const newCourse = {
      id: `course_${Date.now()}`,
      name: courseName,
      instructor: instructorName || 'TBD',
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
      credits: 3
    };

    addCourse(newCourse);
    setImportedCourses([...importedCourses, courseName]);
    setCurrentStep(2);
    setError('');
  };

  const handleParseSyllabus = async () => {
    if (!syllabusText.trim()) {
      setError('Please paste your syllabus content');
      return;
    }

    if (!apiKey && !hasEnvApiKey) {
      setError('Please enter your OpenAI API key to parse the syllabus');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      safeStorage.setItem('openai_api_key', apiKey);
      
      const result = await hybridParser.parseWithComparison(
        syllabusText, 
        courses,
        apiKey
      );
      
      setParsedTasks(result.tasks);
      setCurrentStep(3);
    } catch (err) {
      setError(`Failed to parse syllabus: ${err.message}`);
      console.error('Parse error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImportAll = () => {
    let addedCount = 0;
    for (const task of parsedTasks) {
      addTask(task);
      addedCount++;
    }
    
    alert(`Successfully imported ${addedCount} tasks from ${courseName}!`);
    
    // Ask if they want to add more courses
    if (window.confirm('Would you like to import another course?')) {
      // Reset for next course
      setCurrentStep(1);
      setCourseName('');
      setInstructorName('');
      setSyllabusText('');
      setParsedTasks([]);
    } else {
      navigate('/dashboard');
    }
  };

  const handleSkipAI = () => {
    navigate('/dashboard');
  };

  return (
    <div className={styles.container}>
      {isProcessing && (
        <LoadingSpinner 
          fullScreen 
          message="AI is reading your syllabus and extracting all assignments, exams, and deadlines..." 
          size="large"
        />
      )}
      
      <div className={styles.header}>
        <h1>Import Your Courses from Canvas</h1>
        <p>Let's get all your course information organized in one place</p>
      </div>

      <div className={styles.progressBar}>
        {steps.map((step, index) => (
          <div key={step.id} className={styles.progressStep}>
            <div className={`${styles.stepCircle} ${step.completed ? styles.completed : ''} ${currentStep === step.id ? styles.active : ''}`}>
              {step.completed ? '✓' : step.id}
            </div>
            <span className={styles.stepLabel}>{step.title}</span>
            {index < steps.length - 1 && <div className={styles.stepLine} />}
          </div>
        ))}
      </div>

      <div className={styles.content}>
        {currentStep === 1 && (
          <div className={styles.stepContent}>
            <h2>Step 1: Add Your Course</h2>
            <p className={styles.instructions}>
              Start by adding your course information. You can import multiple courses.
            </p>
            
            <div className={styles.form}>
              <div className={styles.formGroup}>
                <label>Course Name *</label>
                <input
                  type="text"
                  placeholder="e.g., CS 101 - Introduction to Computer Science"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className={styles.input}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Instructor (optional)</label>
                <input
                  type="text"
                  placeholder="e.g., Dr. Smith"
                  value={instructorName}
                  onChange={(e) => setInstructorName(e.target.value)}
                  className={styles.input}
                />
              </div>

              {importedCourses.length > 0 && (
                <div className={styles.importedList}>
                  <p>Already imported:</p>
                  <ul>
                    {importedCourses.map((course, i) => (
                      <li key={i}>✅ {course}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button onClick={handleAddCourse} className={styles.primaryButton}>
                Continue to Syllabus →
              </button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className={styles.stepContent}>
            <h2>Step 2: Import Your Syllabus</h2>
            <div className={styles.instructions}>
              <p><strong>How to get your syllabus from Canvas:</strong></p>
              <ol>
                <li>Go to your course in Canvas</li>
                <li>Click on "Syllabus" in the left menu</li>
                <li>Select all the text (Ctrl+A or Cmd+A)</li>
                <li>Copy it (Ctrl+C or Cmd+C)</li>
                <li>Paste it below</li>
              </ol>
            </div>

            <div className={styles.form}>
              {!hasEnvApiKey && (
                <div className={styles.formGroup}>
                  <label>OpenAI API Key</label>
                  <input
                    type="password"
                    placeholder="sk-..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className={styles.input}
                  />
                  <small>Your key is saved locally and never shared</small>
                </div>
              )}

              <div className={styles.formGroup}>
                <label>Paste Your Syllabus Content</label>
                <textarea
                  placeholder="Paste your entire syllabus here...

Include everything:
- Course schedule
- Assignment deadlines  
- Exam dates
- Project due dates
- Quiz schedules
- Any other important dates

Our AI will extract all relevant information automatically!"
                  value={syllabusText}
                  onChange={(e) => setSyllabusText(e.target.value)}
                  className={styles.textarea}
                  rows={15}
                />
              </div>

              <div className={styles.buttonGroup}>
                <button onClick={handleParseSyllabus} className={styles.primaryButton}>
                  🤖 Extract Tasks with AI
                </button>
                <button onClick={handleSkipAI} className={styles.secondaryButton}>
                  Skip - I'll add tasks manually
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className={styles.stepContent}>
            <h2>Step 3: Review Extracted Tasks</h2>
            <p className={styles.success}>
              🎉 AI found {parsedTasks.length} tasks in your syllabus!
            </p>

            <div className={styles.taskPreview}>
              <h3>Tasks to Import:</h3>
              <div className={styles.taskList}>
                {parsedTasks.slice(0, 10).map((task, index) => (
                  <div key={index} className={styles.taskItem}>
                    <span className={styles.taskType}>{task.type}</span>
                    <span className={styles.taskTitle}>{task.title}</span>
                    <span className={styles.taskDate}>
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                ))}
                {parsedTasks.length > 10 && (
                  <p className={styles.moreItems}>
                    ... and {parsedTasks.length - 10} more tasks
                  </p>
                )}
              </div>
            </div>

            <div className={styles.buttonGroup}>
              <button onClick={handleImportAll} className={styles.primaryButton}>
                ✅ Import All Tasks
              </button>
              <button onClick={() => setCurrentStep(2)} className={styles.secondaryButton}>
                ← Back to Edit
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className={styles.error}>
            ⚠️ {error}
          </div>
        )}
      </div>

      <div className={styles.helpSection}>
        <h3>💡 Tips:</h3>
        <ul>
          <li>Import all your courses at once for the best experience</li>
          <li>The more complete your syllabus, the better the AI extraction</li>
          <li>You can always add or edit tasks later</li>
          <li>Check the Schedule view after importing to see your complete timeline</li>
        </ul>
      </div>
    </div>
  );
};

export default CanvasImport;