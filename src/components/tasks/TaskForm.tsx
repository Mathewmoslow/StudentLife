import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useScheduleStore } from '../../stores/useScheduleStore';
import styles from './TaskForm.module.css';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  type: z.enum(['assignment', 'exam', 'project', 'reading', 'lab']),
  courseId: z.string().min(1, 'Course is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  complexity: z.number().min(1).max(5),
  estimatedHours: z.number().min(0).optional(),
  isHardDeadline: z.boolean(),
  bufferPercentage: z.number().min(0).max(100),
  description: z.string().optional()
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  onClose: () => void;
  taskId?: string | null;
}

const TaskForm: React.FC<TaskFormProps> = ({ onClose, taskId }) => {
  const { addTask, updateTask, tasks, courses } = useScheduleStore();
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
      bufferPercentage: task.bufferPercentage || 20,
      description: task.description
    } : {
      type: 'assignment',
      complexity: 3,
      isHardDeadline: false,
      bufferPercentage: 20
    }
  });
  
  const taskType = watch('type');
  
  const onSubmit = (data: TaskFormData) => {
    if (task) {
      updateTask(task.id, {
        ...data,
        complexity: data.complexity as 1 | 2 | 3 | 4 | 5,
        dueDate: new Date(data.dueDate),
        estimatedHours: data.estimatedHours || 0
      });
    } else {
      addTask({
        title: data.title,
        type: data.type,
        courseId: data.courseId,
        dueDate: new Date(data.dueDate),
        complexity: data.complexity as 1 | 2 | 3 | 4 | 5,
        estimatedHours: data.estimatedHours || 0,
        isHardDeadline: data.isHardDeadline,
        bufferPercentage: data.bufferPercentage,
        status: 'not-started',
        description: data.description
      });
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
              <label>Difficulty</label>
              <input 
                type="range" 
                min="1" 
                max="5" 
                {...register('complexity', { valueAsNumber: true })}
              />
              <div className={styles.complexityDisplay}>
                <span className={styles.stars}>{'⭐'.repeat(watch('complexity') || 3)}</span>
                <span className={styles.complexityLabel}>
                  {watch('complexity') === 1 && 'Very Easy (-50% time)'}
                  {watch('complexity') === 2 && 'Easy (-25% time)'}
                  {watch('complexity') === 3 && 'Normal (base time)'}
                  {watch('complexity') === 4 && 'Hard (+50% time)'}
                  {watch('complexity') === 5 && 'Very Hard (+100% time)'}
                </span>
              </div>
            </div>
          </div>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Estimated Hours (optional)</label>
              <input 
                type="number" 
                step="0.5"
                placeholder="Auto-calculated if empty"
                {...register('estimatedHours', { valueAsNumber: true })}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>Buffer Time %</label>
              <input 
                type="number" 
                min="0" 
                max="100"
                {...register('bufferPercentage', { valueAsNumber: true })}
              />
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label>
              <input 
                type="checkbox" 
                {...register('isHardDeadline')}
              />
              Hard deadline (cannot be moved)
            </label>
          </div>
          
          <div className={styles.formGroup}>
            <label>Description (optional)</label>
            <textarea 
              {...register('description')} 
              rows={3}
              placeholder="Additional notes or requirements"
            />
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
