import React, { useState } from 'react';
import { Event } from '../../types';
import { format } from 'date-fns';
import styles from './EventModal.module.css';
import { useScheduleStore } from '../../stores/useScheduleStore';

interface EventModalProps {
  event: Event | null;
  timeBlock: any | null;
  courses: any[];
  onClose: () => void;
}

const EventModal: React.FC<EventModalProps> = ({ event, timeBlock, courses, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    startTime: '',
    endTime: '',
    location: '',
    description: '',
    type: ''
  });
  
  const { updateEvent, deleteEvent, updateTask, deleteTask, deleteTimeBlock } = useScheduleStore();
  
  if (!event && !timeBlock) return null;
  
  const getCourse = (courseId: string) => {
    return courses.find(c => c.id === courseId);
  };
  
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'exam': return '#ef4444';
      case 'clinical': return '#8b5cf6';
      case 'lab': return '#f59e0b';
      case 'simulation': return '#10b981';
      case 'lecture': return '#3b82f6';
      default: return '#6b7280';
    }
  };
  
  // Helper function to ensure Date objects
  const ensureDate = (date: Date | string): Date => {
    return typeof date === 'string' ? new Date(date) : date;
  };
  
  const handleEdit = () => {
    if (event) {
      const startTime = ensureDate(event.startTime);
      const endTime = ensureDate(event.endTime);
      setEditForm({
        title: event.title,
        startTime: format(startTime, "yyyy-MM-dd'T'HH:mm"),
        endTime: format(endTime, "yyyy-MM-dd'T'HH:mm"),
        location: event.location || '',
        description: event.description || '',
        type: event.type
      });
    } else if (timeBlock?.task) {
      const startTime = ensureDate(timeBlock.block.startTime);
      const endTime = ensureDate(timeBlock.block.endTime);
      setEditForm({
        title: timeBlock.task.title,
        startTime: format(startTime, "yyyy-MM-dd'T'HH:mm"),
        endTime: format(endTime, "yyyy-MM-dd'T'HH:mm"),
        location: '',
        description: timeBlock.task.description || '',
        type: timeBlock.task.type
      });
    }
    setIsEditing(true);
  };
  
  const handleSave = () => {
    if (event) {
      updateEvent(event.id, {
        title: editForm.title,
        startTime: new Date(editForm.startTime),
        endTime: new Date(editForm.endTime),
        location: editForm.location,
        description: editForm.description,
        type: editForm.type as Event['type']
      });
    } else if (timeBlock) {
      updateTask(timeBlock.task.id, {
        title: editForm.title,
        description: editForm.description
      });
    }
    setIsEditing(false);
    onClose();
  };
  
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this?')) {
      if (event) {
        deleteEvent(event.id);
      } else if (timeBlock) {
        deleteTimeBlock(timeBlock.block.id);
      }
      onClose();
    }
  };
  
  if (isEditing) {
    const currentCourse = event ? getCourse(event.courseId) : timeBlock?.task ? getCourse(timeBlock.task.courseId) : null;
    
    return (
      <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.modal} onClick={e => e.stopPropagation()}>
          <div className={styles.modalHeader} style={{ backgroundColor: event ? getEventTypeColor(event.type) : '#10b981' }}>
            <h3>Edit {event ? 'Event' : 'Study Block'}</h3>
            <button className={styles.closeButton} onClick={() => setIsEditing(false)}>×</button>
          </div>
          
          <div className={styles.modalBody}>
            <form className={styles.editForm}>
              <div className={styles.formGroup}>
                <label>Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Course</label>
                <input
                  type="text"
                  value={`${currentCourse?.name || 'Unknown'} (${currentCourse?.code || 'N/A'})`}
                  disabled
                  style={{ opacity: 0.7 }}
                />
              </div>
              
              {event && (
                <div className={styles.formGroup}>
                  <label>Type</label>
                  <select
                    value={editForm.type}
                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                  >
                    <option value="lecture">Lecture</option>
                    <option value="clinical">Clinical</option>
                    <option value="lab">Lab</option>
                    <option value="exam">Exam</option>
                    <option value="simulation">Simulation</option>
                    <option value="review">Review</option>
                  </select>
                </div>
              )}
              
              <div className={styles.formGroup}>
                <label>Start Time</label>
                <input
                  type="datetime-local"
                  value={editForm.startTime}
                  onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>End Time</label>
                <input
                  type="datetime-local"
                  value={editForm.endTime}
                  onChange={(e) => setEditForm({ ...editForm, endTime: e.target.value })}
                />
              </div>
              
              {event && (
                <div className={styles.formGroup}>
                  <label>Location</label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    placeholder="e.g., Room 101, Lab B"
                  />
                </div>
              )}
              
              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                  placeholder="Additional notes..."
                />
              </div>
              
              <div className={styles.formActions}>
                <button type="button" onClick={handleSave} className={styles.saveButton}>
                  Save Changes
                </button>
                <button type="button" onClick={() => setIsEditing(false)} className={styles.cancelButton}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
  
  if (event) {
    const course = getCourse(event.courseId);
    const startTime = ensureDate(event.startTime);
    const endTime = ensureDate(event.endTime);
    
    return (
      <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.modal} onClick={e => e.stopPropagation()}>
          <div className={styles.modalHeader} style={{ backgroundColor: getEventTypeColor(event.type) }}>
            <h3>{event.title}</h3>
            <button className={styles.closeButton} onClick={onClose}>×</button>
          </div>
          
          <div className={styles.modalBody}>
            <div className={styles.modalActions}>
              <button onClick={handleEdit} className={styles.editButton}>
                ✏️ Edit
              </button>
              <button onClick={handleDelete} className={styles.deleteButton}>
                🗑️ Delete
              </button>
            </div>
            
            <div className={styles.eventType}>
              <span className={styles.typeLabel} style={{ backgroundColor: getEventTypeColor(event.type) }}>
                {event.type.toUpperCase()}
              </span>
            </div>
            
            <div className={styles.infoSection}>
              <div className={styles.infoRow}>
                <span className={styles.label}>Course:</span>
                <span>{course ? `${course.name} (${course.code})` : 'No course assigned'}</span>
              </div>
              
              <div className={styles.infoRow}>
                <span className={styles.label}>Date:</span>
                <span>{format(startTime, 'EEEE, MMMM d, yyyy')}</span>
              </div>
              
              <div className={styles.infoRow}>
                <span className={styles.label}>Time:</span>
                <span>{format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}</span>
              </div>
              
              {event.location && (
                <div className={styles.infoRow}>
                  <span className={styles.label}>Location:</span>
                  <span>{event.location}</span>
                </div>
              )}
              
              {event.description && (
                <div className={styles.description}>
                  <span className={styles.label}>Details:</span>
                  <p>{event.description}</p>
                </div>
              )}
            </div>
            
            {event.type === 'exam' && (
              <div className={styles.examInfo}>
                <h4>Exam Preparation Tips:</h4>
                <ul>
                  <li>Review all module materials</li>
                  <li>Complete practice questions</li>
                  <li>Arrive 15 minutes early</li>
                  <li>Bring required materials</li>
                </ul>
              </div>
            )}
            
            {event.type === 'clinical' && (
              <div className={styles.clinicalInfo}>
                <h4>Clinical Requirements:</h4>
                <ul>
                  <li>Arrive by 6:00 AM sharp</li>
                  <li>Wear appropriate scrubs and ID</li>
                  <li>Bring stethoscope and required supplies</li>
                  <li>Complete pre-clinical documentation</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  if (timeBlock) {
    const { block, task } = timeBlock;
    const course = task ? getCourse(task.courseId) : null;
    const startTime = ensureDate(block.startTime);
    const endTime = ensureDate(block.endTime);
    
    return (
      <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.modal} onClick={e => e.stopPropagation()}>
          <div className={styles.modalHeader} style={{ backgroundColor: '#10b981' }}>
            <h3>Study Block: {task?.title || 'Unknown Task'}</h3>
            <button className={styles.closeButton} onClick={onClose}>×</button>
          </div>
          
          <div className={styles.modalBody}>
            <div className={styles.modalActions}>
              <button onClick={handleEdit} className={styles.editButton}>
                ✏️ Edit
              </button>
              <button onClick={handleDelete} className={styles.deleteButton}>
                🗑️ Delete
              </button>
            </div>
            
            <div className={styles.infoSection}>
              <div className={styles.infoRow}>
                <span className={styles.label}>Course:</span>
                <span>{course ? `${course.name} (${course.code})` : 'No course assigned'}</span>
              </div>
              
              <div className={styles.infoRow}>
                <span className={styles.label}>Task Type:</span>
                <span>{task?.type || 'Unknown'}</span>
              </div>
              
              <div className={styles.infoRow}>
                <span className={styles.label}>Due Date:</span>
                <span>{task ? format(ensureDate(task.dueDate), 'MMMM d, yyyy') : 'No due date'}</span>
              </div>
              
              <div className={styles.infoRow}>
                <span className={styles.label}>Study Time:</span>
                <span>{format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}</span>
              </div>
              
              <div className={styles.infoRow}>
                <span className={styles.label}>Complexity:</span>
                <span>{'⭐'.repeat(task?.complexity || 1)}</span>
              </div>
              
              {task?.description && (
                <div className={styles.description}>
                  <span className={styles.label}>Details:</span>
                  <p>{task.description}</p>
                </div>
              )}
            </div>
            
            <div className={styles.studyTips}>
              <h4>Study Session Tips:</h4>
              <ul>
                <li>Find a quiet study space</li>
                <li>Turn off distractions</li>
                <li>Take a 5-10 minute break every hour</li>
                <li>Stay hydrated</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return null;
};

export default EventModal;