import React, { useState } from 'react';
import { useScheduleStore } from '../../stores/useScheduleStore';
import * as chrono from 'chrono-node';
import styles from './QuickAdd.module.css';

const QuickAdd: React.FC = () => {
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const { addTask, courses } = useScheduleStore();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Parse natural language input
    const parsedDate = chrono.parseDate(input);
    const dueDate = parsedDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Default to 1 week
    
    // Extract task type
    let type: 'assignment' | 'exam' | 'project' | 'reading' | 'lab' = 'assignment';
    if (input.toLowerCase().includes('exam') || input.toLowerCase().includes('test')) {
      type = 'exam';
    } else if (input.toLowerCase().includes('project')) {
      type = 'project';
    } else if (input.toLowerCase().includes('read')) {
      type = 'reading';
    } else if (input.toLowerCase().includes('lab')) {
      type = 'lab';
    }
    
    // Clean title by removing the date part
    const cleanTitle = input.replace(chrono.parse(input)[0]?.text || '', '').trim() || 'New Task';
    
    // Auto-estimate hours based on type and complexity
    const getEstimatedHours = (taskType: string): number => {
      const baseHours = {
        assignment: 3,
        exam: 10, // Study time for exam
        project: 15,
        reading: 2,
        lab: 4
      };
      return baseHours[taskType as keyof typeof baseHours] || 3;
    };

    // Create task with all required properties
    addTask({
      title: cleanTitle,
      type,
      courseId: courses[0]?.id || '', // Default to first course
      dueDate,
      complexity: 3 as const, // Explicitly type as literal
      estimatedHours: getEstimatedHours(type), // Auto-estimate based on type
      isHardDeadline: type === 'exam',
      bufferPercentage: type === 'exam' ? 10 : 20,
      status: 'not-started',
      scheduledBlocks: [] // Include required property
    });
    
    setInput('');
    setIsExpanded(false);
  };
  
  return (
    <div className={styles.quickAdd}>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          placeholder="Quick add: 'Math homework due Friday' or 'Read chapter 5 by next week'"
          className={styles.input}
        />
        
        {isExpanded && (
          <div className={styles.hints}>
            <p>💡 Try natural language like:</p>
            <ul>
              <li>"Essay about climate change due next Monday"</li>
              <li>"Math exam on December 15th"</li>
              <li>"Read chapters 3-5 by tomorrow"</li>
              <li>"CS project presentation next week"</li>
            </ul>
          </div>
        )}
        
        <button type="submit" className={styles.submitButton}>
          Add Task
        </button>
      </form>
    </div>
  );
};

export default QuickAdd;