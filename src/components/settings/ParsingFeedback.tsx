import React, { useState } from 'react';
import { mlTrainingService, LearningFeedback } from '../../services/mlTrainingService';
import { patternEvolutionService } from '../../services/patternEvolutionService';

interface ParsingFeedbackProps {
  parseId: string;
  originalTask: any;
  onClose: () => void;
  onCorrectionSaved: () => void;
}

const ParsingFeedback: React.FC<ParsingFeedbackProps> = ({
  parseId,
  originalTask,
  onClose,
  onCorrectionSaved
}) => {
  const [correctedTask, setCorrectedTask] = useState(originalTask);
  const [issue, setIssue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!issue) {
      alert('Please describe what was wrong with the parsing');
      return;
    }

    setIsSubmitting(true);

    try {
      // Record the correction for ML training
      const feedback: LearningFeedback = {
        parseId,
        originalTask,
        correctedTask,
        issue,
        suggestion: `Task should be: ${JSON.stringify(correctedTask)}`
      };

      await mlTrainingService.recordCorrection(feedback);

      // Trigger pattern evolution based on this correction
      setTimeout(async () => {
        const patterns = mlTrainingService.getEvolvedPatterns();
        await patternEvolutionService.evolvePatterns(
          originalTask.title || '',
          correctedTask,
          patterns
        );
        
        console.log('🎓 ML system learned from your correction!');
      }, 1000);

      onCorrectionSaved();
      onClose();
    } catch (error) {
      console.error('Failed to save correction:', error);
      alert('Failed to save correction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <h2 style={{ marginTop: 0 }}>🔧 Help Improve Parsing</h2>
        <p style={{ color: '#6b7280' }}>
          Your corrections help the AI learn and improve for everyone!
        </p>

        <div style={{ marginBottom: '20px' }}>
          <h3>Original Parsing:</h3>
          <pre style={{
            backgroundColor: '#f3f4f6',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '0.9rem',
            overflow: 'auto'
          }}>
            {JSON.stringify(originalTask, null, 2)}
          </pre>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3>What was wrong?</h3>
          <select
            value={issue}
            onChange={(e) => setIssue(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              fontSize: '1rem'
            }}
          >
            <option value="">Select an issue...</option>
            <option value="wrong_date">Wrong date</option>
            <option value="wrong_type">Wrong task type</option>
            <option value="wrong_hours">Wrong estimated hours</option>
            <option value="wrong_course">Wrong course</option>
            <option value="missing_task">Task was missing</option>
            <option value="duplicate_task">Duplicate task</option>
            <option value="wrong_title">Wrong title</option>
            <option value="other">Other issue</option>
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3>Correct the task:</h3>
          
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Title:
            </label>
            <input
              type="text"
              value={correctedTask.title || ''}
              onChange={(e) => setCorrectedTask({ ...correctedTask, title: e.target.value })}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '6px',
                border: '1px solid #d1d5db'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Type:
              </label>
              <select
                value={correctedTask.type || 'assignment'}
                onChange={(e) => setCorrectedTask({ ...correctedTask, type: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db'
                }}
              >
                <option value="assignment">Assignment</option>
                <option value="exam">Exam</option>
                <option value="project">Project</option>
                <option value="reading">Reading</option>
                <option value="lab">Lab</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Due Date:
              </label>
              <input
                type="date"
                value={correctedTask.dueDate ? 
                  new Date(correctedTask.dueDate).toISOString().split('T')[0] : ''}
                onChange={(e) => setCorrectedTask({ 
                  ...correctedTask, 
                  dueDate: new Date(e.target.value).toISOString() 
                })}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Estimated Hours:
              </label>
              <input
                type="number"
                value={correctedTask.estimatedHours || 3}
                onChange={(e) => setCorrectedTask({ 
                  ...correctedTask, 
                  estimatedHours: parseFloat(e.target.value) 
                })}
                min="0.5"
                step="0.5"
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Complexity (1-5):
              </label>
              <input
                type="number"
                value={correctedTask.complexity || 3}
                onChange={(e) => setCorrectedTask({ 
                  ...correctedTask, 
                  complexity: parseInt(e.target.value) 
                })}
                min="1"
                max="5"
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db'
                }}
              />
            </div>
          </div>
        </div>

        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          justifyContent: 'flex-end',
          borderTop: '1px solid #e5e7eb',
          paddingTop: '16px',
          marginTop: '20px'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !issue}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: isSubmitting ? '#9ca3af' : '#10b981',
              color: 'white',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            {isSubmitting ? 'Saving...' : '🎓 Submit Correction'}
          </button>
        </div>

        <div style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: '#fef3c7',
          borderRadius: '8px',
          fontSize: '0.875rem'
        }}>
          <strong>🤖 How this helps:</strong> Your correction teaches the system to better recognize 
          similar patterns in future imports. The more corrections we receive, the smarter the 
          parser becomes for everyone!
        </div>
      </div>
    </div>
  );
};

export default ParsingFeedback;