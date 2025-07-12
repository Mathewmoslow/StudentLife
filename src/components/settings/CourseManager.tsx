import React, { useState } from 'react';
import { useScheduleStore } from '../../stores/useScheduleStore';
import styles from './CourseManager.module.css';

const CourseManager: React.FC = () => {
  const { courses, addCourse, updateCourse, deleteCourse } = useScheduleStore();
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<string | null>(null);
  
  const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const courseData = {
      name: formData.get('name') as string,
      code: formData.get('code') as string,
      professor: formData.get('professor') as string,
      credits: Number(formData.get('credits')),
      color: formData.get('color') as string,
      schedule: [] // Would be populated from schedule inputs
    };
    
    if (editingCourse) {
      updateCourse(editingCourse, courseData);
    } else {
      addCourse(courseData);
    }
    
    setShowForm(false);
    setEditingCourse(null);
  };
  
  return (
    <div className={styles.courseManager}>
      <div className={styles.header}>
        <h3>Your Courses</h3>
        <button onClick={() => setShowForm(true)} className={styles.addButton}>
          + Add Course
        </button>
      </div>
      
      <div className={styles.courseList}>
        {courses.map(course => (
          <div key={course.id} className={styles.courseItem}>
            <div 
              className={styles.colorIndicator} 
              style={{ backgroundColor: course.color }}
            />
            <div className={styles.courseInfo}>
              <h4>{course.code} - {course.name}</h4>
              <p>{course.professor} • {course.credits} credits</p>
            </div>
            <div className={styles.courseActions}>
              <button onClick={() => {
                setEditingCourse(course.id);
                setShowForm(true);
              }}>Edit</button>
              <button onClick={() => deleteCourse(course.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
      
      {showForm && (
        <div className={styles.overlay}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <h3>{editingCourse ? 'Edit Course' : 'Add Course'}</h3>
            
            <input name="code" placeholder="Course Code (e.g., CS 101)" required />
            <input name="name" placeholder="Course Name" required />
            <input name="professor" placeholder="Professor Name" required />
            <input name="credits" type="number" placeholder="Credits" min="1" max="6" required />
            
            <div className={styles.colorPicker}>
              <label>Color:</label>
              <div className={styles.colors}>
                {colors.map(color => (
                  <label key={color}>
                    <input type="radio" name="color" value={color} defaultChecked={color === colors[0]} />
                    <span style={{ backgroundColor: color }} />
                  </label>
                ))}
              </div>
            </div>
            
            <div className={styles.formActions}>
              <button type="button" onClick={() => {
                setShowForm(false);
                setEditingCourse(null);
              }}>Cancel</button>
              <button type="submit">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CourseManager;
