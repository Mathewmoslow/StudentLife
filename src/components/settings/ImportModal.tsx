import React, { useState } from 'react';
import { useScheduleStore } from '../../stores/useScheduleStore';
import { parseScheduleText } from '../../services/aiParser';
import { parseWithOpenAI } from '../../services/openaiParser';
import { hybridParser } from '../../services/hybridParser';
import { safeStorage } from '../../utils/safeStorage';
import LoadingSpinner from '../common/LoadingSpinner';
import styles from './ImportModal.module.css';

interface ImportModalProps {
  onClose: () => void;
}

const ImportModal: React.FC<ImportModalProps> = ({ onClose }) => {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [useAI, setUseAI] = useState(true);
  const [apiKey, setApiKey] = useState(safeStorage.getItem('openai_api_key') || '');
  const { addTask, courses } = useScheduleStore();
  
  // Check if API key is configured via environment variable
  const hasEnvApiKey = !!import.meta.env.VITE_OPENAI_API_KEY;

  const handleImport = async () => {
    if (!inputText.trim()) {
      setError('Please paste your schedule or task list');
      return;
    }

    if (useAI && !apiKey && !hasEnvApiKey) {
      setError('Please enter your OpenAI API key or disable AI parsing');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      let tasks;
      
      if (useAI) {
        // Save API key for future use
        safeStorage.setItem('openai_api_key', apiKey);
        
        try {
          // Use hybrid parser for comparison and learning
          const result = await hybridParser.parseWithComparison(inputText, courses, apiKey);
          tasks = result.tasks;
          
          // Get the score (hidden from user)
          const score = result.score;
          console.log(`✅ AI successfully extracted ${tasks.length} tasks`);
          
          // Log score history for developer analysis
          if (score.overallScore < 50) {
            console.debug('📊 Parse quality needs improvement');
          }
        } catch (aiError) {
          console.error('AI parsing failed:', aiError);
          // Show error but don't fallback - user wants AI only
          setError(`AI parsing failed: ${aiError.message}. Please check your API key and try again.`);
          return;
        }
      } else {
        // Use smart parser directly
        tasks = parseScheduleText(inputText, courses);
      }
      
      if (!tasks || tasks.length === 0) {
        setError('No tasks could be extracted. Try different formatting.');
        return;
      }
      
      // Add all tasks to the store
      let addedCount = 0;
      for (const task of tasks) {
        addTask(task);
        addedCount++;
      }

      alert(`Successfully imported ${addedCount} tasks!`);
      onClose();
    } catch (err) {
      setError(`Failed to parse: ${err.message}`);
      console.error('Import error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={styles.overlay}>
      {isProcessing && (
        <LoadingSpinner 
          fullScreen 
          message="AI is analyzing your schedule... This may take a moment for large syllabi." 
          size="large"
        />
      )}
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Import Schedule</h2>
          <button onClick={onClose} className={styles.closeButton}>×</button>
        </div>

        <div className={styles.content}>
          <p className={styles.instructions}>
            Paste your schedule from any source - syllabus, Canvas, Blackboard, or even a simple list.
            AI will extract all tasks, assignments, and deadlines with proper context understanding.
          </p>

          <div className={styles.aiSettings}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={useAI}
                onChange={(e) => setUseAI(e.target.checked)}
              />
              <span>Use AI parsing (recommended for complex text)</span>
            </label>
            
            {useAI && !hasEnvApiKey && (
              <div className={styles.apiKeyInput}>
                <label>OpenAI API Key:</label>
                <input
                  type="password"
                  placeholder="sk-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className={styles.keyInput}
                />
                <small>Your key is saved locally and never sent to our servers</small>
              </div>
            )}
            
            {useAI && hasEnvApiKey && (
              <div className={styles.apiKeyInput}>
                <small style={{ color: '#10b981' }}>✓ API key configured via environment</small>
              </div>
            )}
          </div>

          <div className={styles.examples}>
            <h4>AI can understand:</h4>
            <ul>
              <li>• Complete syllabi with course schedules</li>
              <li>• Email announcements about assignments</li>
              <li>• Canvas/Blackboard assignment lists</li>
              <li>• Informal notes like "Quiz next Friday on chapters 1-3"</li>
              <li>• Mixed formats and complex scheduling text</li>
            </ul>
          </div>

          <textarea
            className={styles.textInput}
            placeholder="Paste your schedule, syllabus, or task list here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={15}
          />

          {error && <div className={styles.error}>{error}</div>}
        </div>

        <div className={styles.footer}>
          <button onClick={onClose} className={styles.cancelButton}>
            Cancel
          </button>
          <button 
            onClick={handleImport} 
            className={styles.importButton}
            disabled={isProcessing || !inputText.trim()}
          >
            {isProcessing ? 'AI is Processing...' : 'Import Tasks'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;