import React, { useState, useEffect, useRef } from 'react';
import { useScheduleStore } from '../../stores/useScheduleStore';
import { useNavigate } from 'react-router-dom';
import { Task, Course, Event } from '../../types';
import { format } from 'date-fns';
import styles from './GlobalSearch.module.css';

type SearchResult = {
  type: 'task' | 'course' | 'event';
  item: Task | Course | Event;
  matchedField: string;
  matchText: string;
};

const GlobalSearch: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  
  const { tasks, courses, events } = useScheduleStore();

  // Keyboard shortcut to open search (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Perform search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchTerm = query.toLowerCase();
    const searchResults: SearchResult[] = [];

    // Search tasks
    tasks.forEach(task => {
      if (task.title.toLowerCase().includes(searchTerm)) {
        searchResults.push({
          type: 'task',
          item: task,
          matchedField: 'title',
          matchText: task.title
        });
      } else if (task.description?.toLowerCase().includes(searchTerm)) {
        searchResults.push({
          type: 'task',
          item: task,
          matchedField: 'description',
          matchText: task.description || ''
        });
      }
    });

    // Search courses
    courses.forEach(course => {
      if (course.name.toLowerCase().includes(searchTerm)) {
        searchResults.push({
          type: 'course',
          item: course,
          matchedField: 'name',
          matchText: course.name
        });
      } else if (course.code.toLowerCase().includes(searchTerm)) {
        searchResults.push({
          type: 'course',
          item: course,
          matchedField: 'code',
          matchText: course.code
        });
      } else if (course.professor?.toLowerCase().includes(searchTerm)) {
        searchResults.push({
          type: 'course',
          item: course,
          matchedField: 'professor',
          matchText: course.professor || ''
        });
      }
    });

    // Search events
    events.forEach(event => {
      if (event.title.toLowerCase().includes(searchTerm)) {
        searchResults.push({
          type: 'event',
          item: event,
          matchedField: 'title',
          matchText: event.title
        });
      } else if (event.description?.toLowerCase().includes(searchTerm)) {
        searchResults.push({
          type: 'event',
          item: event,
          matchedField: 'description',
          matchText: event.description || ''
        });
      } else if (event.location?.toLowerCase().includes(searchTerm)) {
        searchResults.push({
          type: 'event',
          item: event,
          matchedField: 'location',
          matchText: event.location || ''
        });
      }
    });

    // Sort by relevance (title matches first)
    searchResults.sort((a, b) => {
      if (a.matchedField === 'title' && b.matchedField !== 'title') return -1;
      if (a.matchedField !== 'title' && b.matchedField === 'title') return 1;
      return 0;
    });

    setResults(searchResults.slice(0, 10)); // Limit to 10 results
    setSelectedIndex(0);
  }, [query, tasks, courses, events]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      handleSelectResult(results[selectedIndex]);
    }
  };

  const handleSelectResult = (result: SearchResult) => {
    setIsOpen(false);
    setQuery('');
    
    switch (result.type) {
      case 'task':
        navigate('/tasks');
        // Could also scroll to specific task if we add that functionality
        break;
      case 'course':
        navigate('/settings');
        break;
      case 'event':
        navigate('/schedule');
        break;
    }
  };

  const highlightMatch = (text: string, searchTerm: string) => {
    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return (
      <>
        {parts.map((part, index) =>
          part.toLowerCase() === searchTerm.toLowerCase() ? (
            <mark key={index} className={styles.highlight}>{part}</mark>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </>
    );
  };

  const getIcon = (type: 'task' | 'course' | 'event') => {
    switch (type) {
      case 'task': return '📋';
      case 'course': return '📚';
      case 'event': return '📅';
    }
  };

  const getSubtext = (result: SearchResult): string => {
    switch (result.type) {
      case 'task':
        const task = result.item as Task;
        return `Due ${format(new Date(task.dueDate), 'MMM d')} • ${task.type}`;
      case 'course':
        const course = result.item as Course;
        return `${course.code} • ${course.credits} credits`;
      case 'event':
        const event = result.item as Event;
        return `${format(new Date(event.startTime), 'MMM d, h:mm a')}`;
    }
  };

  if (!isOpen) {
    return (
      <button 
        className={styles.searchTrigger}
        onClick={() => setIsOpen(true)}
        aria-label="Open search"
      >
        <span className={styles.searchIcon}>🔍</span>
        <span className={styles.searchText}>Search...</span>
        <kbd className={styles.shortcut}>⌘K</kbd>
      </button>
    );
  }

  return (
    <div className={styles.searchModal} onClick={() => setIsOpen(false)}>
      <div 
        className={styles.searchContainer}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.searchHeader}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search tasks, courses, events..."
            className={styles.searchInput}
          />
          <button 
            className={styles.closeButton}
            onClick={() => setIsOpen(false)}
          >
            ✕
          </button>
        </div>

        {results.length > 0 && (
          <div className={styles.searchResults}>
            {results.map((result, index) => (
              <div
                key={`${result.type}-${result.item.id}`}
                className={`${styles.searchResult} ${index === selectedIndex ? styles.selected : ''}`}
                onClick={() => handleSelectResult(result)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <span className={styles.resultIcon}>
                  {getIcon(result.type)}
                </span>
                <div className={styles.resultContent}>
                  <div className={styles.resultTitle}>
                    {highlightMatch(result.matchText, query)}
                  </div>
                  <div className={styles.resultSubtext}>
                    {getSubtext(result)}
                    {result.matchedField !== 'title' && (
                      <span className={styles.matchedField}>
                        {' • '} matched in {result.matchedField}
                      </span>
                    )}
                  </div>
                </div>
                <span className={styles.resultType}>
                  {result.type}
                </span>
              </div>
            ))}
          </div>
        )}

        {query && results.length === 0 && (
          <div className={styles.noResults}>
            No results found for "{query}"
          </div>
        )}

        <div className={styles.searchFooter}>
          <div className={styles.footerHint}>
            <kbd>↑↓</kbd> to navigate
          </div>
          <div className={styles.footerHint}>
            <kbd>↵</kbd> to select
          </div>
          <div className={styles.footerHint}>
            <kbd>esc</kbd> to close
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;