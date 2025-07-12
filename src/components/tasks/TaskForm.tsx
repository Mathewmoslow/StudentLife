import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useScheduleStore } from '../../stores/useScheduleStore';
import { CreateTaskData } from '../../types';
import styles from './TaskForm.module.css';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  type: z.enum(['assignment', 'exam', 'project', 'reading', 'lab']),
  courseId: z.string().min(1, 'Course is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  complexity: z.number().min(1).max(5),
  estimatedHours: z.number().min(0).optional(),
  isHardDeadline: z.boolean(),
  description: z.string().optional()
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  onClose: () => void;
  taskId?: string | null;
}

const TaskForm: React.FC<TaskFormProps> = ({ onClose, taskId }) => {
  const { addTask, updateTask, tasks, courses, preferences } = useScheduleStore();
  const task = taskId ? tasks.find(t => t.id === taskId) : null;
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: task ? {
      title: task.title,
      type: task.type,
      courseId: task.courseId,
      dueDate: new Date(task.dueDate).toISOString().split('T')[0],
      complexity: task.complexity,
      estimatedHours: task.estimatedHours,
      isHardDeadline: task.isHardDeadline,
      description: task.description
    } : {
      type: 'assignment',
      complexity: 3,
      isHardDeadline: false
    }
  });
  
  const watchedType = watch('type');
  const watchedComplexity = watch('complexity');
  
  // Calculate estimated hours preview
  const getEstimatedHoursPreview = (): number => {
    const customHours = watch('estimatedHours');
    if (customHours && customHours > 0) {
      return customHours;
    }
    
    const baseHours = preferences.defaultHoursPerType[watchedType];
    const multiplier = preferences.complexityMultipliers[watchedComplexity as keyof typeof preferences.complexityMultipliers];
    
    return Math.round((baseHours * multiplier) * 10) / 10; // Round to 1 decimal
  };
  
  const getBufferDaysPreview = (): number => {
    // If task already has bufferDays set, use those, otherwise use preferences
    if (task?.bufferDays !== undefined) {
      return task.bufferDays;
    }
    
    switch (watchedType) {
      case 'exam': return preferences.daysBeforeExam;
      case 'assignment': return preferences.daysBeforeAssignment;
      case 'project': return preferences.daysBeforeProject;
      case 'reading': return preferences.daysBeforeReading;
      case 'lab': return preferences.daysBeforeLab;
      default: return 3;
    }
  };
  
  const getDaysToStartPreview = (): number => {
    const estimatedHours = getEstimatedHoursPreview();
    const bufferDays = getBufferDaysPreview();
    const daysNeeded = Math.ceil(estimatedHours / preferences.hoursPerWorkDay);
    return daysNeeded + bufferDays;
  };
  
  const onSubmit = (data: TaskFormData) => {
    const taskData: CreateTaskData = {
      title: data.title,
      type: data.type,
      courseId: data.courseId,
      dueDate: new Date(data.dueDate),
      complexity: data.complexity as 1 | 2 | 3 | 4 | 5,
      status: 'not-started',
      // Optional fields
      ...(data.estimatedHours && data.estimatedHours > 0 && { estimatedHours: data.estimatedHours }),
      ...(data.isHardDeadline !== undefined && { isHardDeadline: data.isHardDeadline }),
      ...(data.description && { description: data.description }),
      ...(task?.scheduledBlocks && { scheduledBlocks: task.scheduledBlocks })
    };
    
    if (task) {
      updateTask(task.id, taskData);
    } else {
      addTask(taskData);
    }
    
    onClose();
  };
  
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>{task ? 'Edit Task' : 'New Task'}</h2>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.formGroup}>
            <label>Title</label>
            <input {...register('title')} placeholder="e.g., Chapter 5 Reading" />
            {errors.title && <span className={styles.error}>{errors.title.message}</span>}
          </div>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Type</label>
              <select {...register('type')}>
                <option value="assignment">Assignment</option>
                <option value="exam">Exam</option>
                <option value="project">Project</option>
                <option value="reading">Reading</option>
                <option value="lab">Lab</option>
              </select>
            </div>
            
            <div className={styles.formGroup}>
              <label>Course</label>
              <select {...register('courseId')}>
                <option value="">Select a course</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.code} - {course.name}
                  </option>
                ))}
              </select>
              {errors.courseId && <span className={styles.error}>{errors.courseId.message}</span>}
            </div>
          </div>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Due Date</label>
              <input type="date" {...register('dueDate')} />
              {errors.dueDate && <span className={styles.error}>{errors.dueDate.message}</span>}
            </div>
            
            <div className={styles.formGroup}>
              <label>Complexity (1-5)</label>
              <input 
                type="range" 
                min="1" 
                max="5" 
                {...register('complexity', { valueAsNumber: true })}
              />
              <span className={styles.rangeValue}>
                {watchedComplexity} - {['Very Easy', 'Easy', 'Medium', 'Hard', 'Very Hard'][watchedComplexity - 1]}
              </span>
            </div>
          </div>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Estimated Hours (optional)</label>
              <input 
                type="number" 
                step="0.5"
                placeholder={`Auto: ${getEstimatedHoursPreview()}h`}
                {...register('estimatedHours', { valueAsNumber: true })}
              />
              <small className={styles.hint}>
                Leave empty to use: {preferences.defaultHoursPerType[watchedType]}h × {preferences.complexityMultipliers[watchedComplexity as keyof typeof preferences.complexityMultipliers]} = {getEstimatedHoursPreview()}h
              </small>
            </div>
            
            <div className={styles.formGroup}>
              <label>Hard Deadline</label>
              <label className={styles.checkboxLabel}>
                <input 
                  type="checkbox" 
                  {...register('isHardDeadline')}
                />
                Cannot be moved/extended
              </label>
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label>Description (optional)</label>
            <textarea 
              {...register('description')} 
              rows={3}
              placeholder="Additional notes or requirements"
            />
          </div>
          
          {/* Scheduling Preview */}
          <div className={styles.preview}>
            <h4>📅 Scheduling Preview</h4>
            <div className={styles.previewGrid}>
              <div className={styles.previewItem}>
                <span className={styles.previewLabel}>Estimated Hours:</span>
                <span className={styles.previewValue}>{getEstimatedHoursPreview()}h</span>
              </div>
              <div className={styles.previewItem}>
                <span className={styles.previewLabel}>Buffer Days:</span>
                <span className={styles.previewValue}>{getBufferDaysPreview()} days</span>
              </div>
              <div className={styles.previewItem}>
                <span className={styles.previewLabel}>Work Days Needed:</span>
                <span className={styles.previewValue}>{Math.ceil(getEstimatedHoursPreview() / preferences.hoursPerWorkDay)} days</span>
              </div>
              <div className={styles.previewItem}>
                <span className={styles.previewLabel}>Start Work:</span>
                <span className={styles.previewValue}>{getDaysToStartPreview()} days before due</span>
              </div>
              <div className={styles.previewItem}>
                <span className={styles.previewLabel}>Hours/Day:</span>
                <span className={styles.previewValue}>{preferences.hoursPerWorkDay}h</span>
              </div>
            </div>
            <small className={styles.previewNote}>
              You can customize these defaults in Settings → Study Preferences
            </small>
          </div>
          
          <div className={styles.formActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" className={styles.submitButton}>
              {task ? 'Update' : 'Create'} Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;