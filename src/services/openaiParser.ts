import { Course } from '../types';
import { mlTrainingService, ParsingResult } from './mlTrainingService';
import { patternEvolutionService } from './patternEvolutionService';

// Strict schema for AI response
interface AITaskResponse {
  tasks: Array<{
    title: string;
    type: 'assignment' | 'exam' | 'project' | 'reading' | 'lab';
    dueDate: string; // ISO date string
    estimatedHours: number;
    complexity: 1 | 2 | 3 | 4 | 5;
    courseIdentifier?: string; // Course name or code to match
    description?: string;
  }>;
}

const SYSTEM_PROMPT = `You are a task extraction assistant. Extract ALL academic tasks, assignments, and deadlines from the provided text.

CRITICAL RULES:
1. Return ONLY valid JSON matching the exact schema provided
2. NO additional text, explanations, or commentary - ONLY JSON
3. Extract EVERY task, assignment, exam, quiz, reading, project, or deadline mentioned
4. Use today's date as reference for relative dates (e.g., "next week", "tomorrow")
5. For tasks without explicit dates, make reasonable academic estimates
6. Estimate hours based on task type and scope
7. Set complexity 1-5 (1=easy reading, 5=major exam/project)
8. If the response would be long, prioritize completeness over verbosity
9. Each task must have ALL required fields

JSON SCHEMA:
{
  "tasks": [
    {
      "title": "string - concise task name",
      "type": "assignment|exam|project|reading|lab",
      "dueDate": "YYYY-MM-DD format",
      "estimatedHours": number,
      "complexity": 1-5,
      "courseIdentifier": "optional - course name/code if mentioned",
      "description": "optional - additional details"
    }
  ]
}

Task Type Guidelines:
- "exam": tests, quizzes, midterms, finals
- "assignment": homework, problem sets, exercises
- "project": presentations, papers, group projects
- "reading": chapters, articles, textbook sections
- "lab": lab reports, experiments, practicals

Hour Estimation Guidelines:
- Reading: 1-2 hours per chapter
- Assignment: 2-4 hours
- Quiz: 2-3 hours study
- Exam: 6-10 hours study
- Project: 8-20 hours
- Lab: 3-5 hours

IMPORTANT: Output MUST be valid JSON only. Start with { and end with }

Today's date for reference: ${new Date().toISOString().split('T')[0]}`;

// Token estimation (rough approximation)
function estimateTokens(text: string): number {
  // Rough estimate: ~1 token per 4 characters
  return Math.ceil(text.length / 4);
}

function calculateCost(inputTokens: number, outputTokens: number): number {
  // GPT-4o pricing: $5 per 1M input tokens, $15 per 1M output tokens
  const inputCost = (inputTokens / 1000000) * 5;
  const outputCost = (outputTokens / 1000000) * 15;
  return inputCost + outputCost;
}

export async function parseWithOpenAI(
  text: string, 
  courses: Course[],
  apiKey?: string
): Promise<ParsedTask[]> {
  const parseId = `parse_${Date.now()}`;
  const startTime = Date.now();
  
  // Get API key from environment or parameter
  // In Vite, environment variables are available via import.meta.env
  const openaiKey = apiKey || import.meta.env.VITE_OPENAI_API_KEY || localStorage.getItem('openai_api_key');
  
  if (!openaiKey) {
    throw new Error('OpenAI API key not configured. Please add it in Settings.');
  }

  // Estimate tokens and cost
  const inputText = SYSTEM_PROMPT + text + courses.map(c => `${c.code} - ${c.name}`).join(', ');
  const estimatedInputTokens = estimateTokens(inputText);
  const maxOutputTokens = 12000; // Increased significantly for long syllabi
  const estimatedCost = calculateCost(estimatedInputTokens, maxOutputTokens / 3); // Assume 1/3 of max for output
  
  console.log(`📊 Token Estimation:`);
  console.log(`  Input: ~${estimatedInputTokens} tokens`);
  console.log(`  Max Output: ${maxOutputTokens} tokens`);
  console.log(`  Estimated Cost: $${estimatedCost.toFixed(4)}`);
  console.log(`  (Actual cost will be less based on actual output tokens)`);
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { 
            role: 'user', 
            content: `Extract all tasks from this text:\n\n${text}\n\nAvailable courses: ${courses.map(c => `${c.code} - ${c.name}`).join(', ') || 'No courses specified'}` 
          }
        ],
        temperature: 0.1, // Low temperature for consistent formatting
        max_tokens: maxOutputTokens,
        response_format: { type: "json_object" }, // Force JSON response format
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    // Log actual token usage if available
    if (data.usage) {
      const actualCost = calculateCost(data.usage.prompt_tokens, data.usage.completion_tokens);
      console.log(`✅ Actual Token Usage:`);
      console.log(`  Input: ${data.usage.prompt_tokens} tokens`);
      console.log(`  Output: ${data.usage.completion_tokens} tokens`);
      console.log(`  Total: ${data.usage.total_tokens} tokens`);
      console.log(`  Actual Cost: $${actualCost.toFixed(4)}`);
    }

    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Parse and validate the JSON response
    const parsed = parseAndValidateResponse(content);
    
    // Convert to our internal format
    const tasks = convertToInternalFormat(parsed, courses);
    
    // Save successful parsing for ML training
    const parsingResult: ParsingResult = {
      id: parseId,
      timestamp: new Date(),
      originalText: text,
      aiParsedTasks: tasks,
      patterns: {
        datePatterns: extractPatterns(text, 'date'),
        taskIndicators: extractPatterns(text, 'task'),
        courseIdentifiers: extractPatterns(text, 'course')
      },
      success: true
    };
    
    await mlTrainingService.saveParsingResult(parsingResult);
    
    // Analyze patterns in background for continuous learning
    setTimeout(async () => {
      const patterns = mlTrainingService.getEvolvedPatterns();
      // Pattern performance analysis happens during parsing
      
      const report = mlTrainingService.generateLearningReport();
      console.log('🧠 ML Training Report:');
      console.log(`  Success Rate: ${(report.successRate * 100).toFixed(1)}%`);
      console.log(`  Total Parses: ${report.totalParses}`);
      console.log(`  Pattern Confidence:`, 
        patterns.slice(0, 3).map(p => `${p.type}: ${(p.confidence * 100).toFixed(1)}%`).join(', '));
    }, 2000);
    
    return tasks;

  } catch (error) {
    console.error('OpenAI parsing failed:', error);
    
    // Save failed parsing for learning
    const parsingResult: ParsingResult = {
      id: parseId,
      timestamp: new Date(),
      originalText: text,
      aiParsedTasks: [],
      patterns: {
        datePatterns: extractPatterns(text, 'date'),
        taskIndicators: extractPatterns(text, 'task'),
        courseIdentifiers: extractPatterns(text, 'course')
      },
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    };
    
    await mlTrainingService.saveParsingResult(parsingResult);
    
    // Try to learn from the failure
    setTimeout(async () => {
      const patterns = mlTrainingService.getEvolvedPatterns();
      await patternEvolutionService.evolvePatterns(text, null, patterns);
      console.log('🔧 Learning from parsing failure to improve future results');
    }, 2000);
    
    throw error;
  }
}

function parseAndValidateResponse(content: string): AITaskResponse {
  try {
    // Remove markdown code blocks if present
    let cleanContent = content.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Try to extract JSON from the response
    const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    let jsonStr = jsonMatch[0];
    
    // Attempt to fix truncated JSON by closing open structures
    const openBraces = (jsonStr.match(/\{/g) || []).length;
    const closeBraces = (jsonStr.match(/\}/g) || []).length;
    const openBrackets = (jsonStr.match(/\[/g) || []).length;
    const closeBrackets = (jsonStr.match(/\]/g) || []).length;
    
    // If JSON is truncated, try to close it properly
    if (openBrackets > closeBrackets || openBraces > closeBraces) {
      console.warn('JSON appears truncated, attempting to fix...');
      
      // Find the last complete task object
      const lastCompleteTask = jsonStr.lastIndexOf('},');
      if (lastCompleteTask > 0) {
        jsonStr = jsonStr.substring(0, lastCompleteTask + 1);
      }
      
      // Close the array and object
      if (!jsonStr.trim().endsWith(']')) {
        jsonStr += ']';
      }
      if (!jsonStr.trim().endsWith('}')) {
        jsonStr += '}';
      }
    }

    const parsed = JSON.parse(jsonStr);
    
    // Validate structure
    if (!parsed.tasks || !Array.isArray(parsed.tasks)) {
      throw new Error('Invalid response structure: missing tasks array');
    }

    // Validate each task
    for (const task of parsed.tasks) {
      if (!task.title || !task.type || !task.dueDate) {
        throw new Error(`Invalid task: missing required fields`);
      }
      
      // Validate type
      if (!['assignment', 'exam', 'project', 'reading', 'lab'].includes(task.type)) {
        task.type = 'assignment'; // Default fallback
      }
      
      // Validate complexity
      if (!task.complexity || task.complexity < 1 || task.complexity > 5) {
        task.complexity = 3; // Default middle complexity
      }
      
      // Ensure estimatedHours exists
      if (!task.estimatedHours || task.estimatedHours <= 0) {
        task.estimatedHours = getDefaultHours(task.type);
      }
    }

    return parsed as AITaskResponse;

  } catch (error) {
    console.error('Failed to parse AI response:', content);
    throw new Error(`Failed to parse AI response: ${error.message}`);
  }
}

function getDefaultHours(type: string): number {
  switch (type) {
    case 'exam': return 8;
    case 'project': return 10;
    case 'assignment': return 3;
    case 'reading': return 2;
    case 'lab': return 4;
    default: return 3;
  }
}

interface ParsedTask {
  title: string;
  type: 'assignment' | 'exam' | 'project' | 'reading' | 'lab';
  courseId: string;
  dueDate: Date;
  complexity: 1 | 2 | 3 | 4 | 5;
  estimatedHours: number;
  isHardDeadline: boolean;
  bufferPercentage: number;
  status: 'not-started';
  description?: string;
}

function convertToInternalFormat(aiResponse: AITaskResponse, courses: Course[]): ParsedTask[] {
  return aiResponse.tasks.map(task => {
    // Match course
    let courseId = courses[0]?.id || 'default';
    if (task.courseIdentifier && courses.length > 0) {
      const matched = courses.find(c => 
        c.code.toLowerCase().includes(task.courseIdentifier!.toLowerCase()) ||
        c.name.toLowerCase().includes(task.courseIdentifier!.toLowerCase()) ||
        task.courseIdentifier!.toLowerCase().includes(c.code.toLowerCase()) ||
        task.courseIdentifier!.toLowerCase().includes(c.name.toLowerCase())
      );
      if (matched) {
        courseId = matched.id;
      }
    }

    // Parse date
    let dueDate: Date;
    try {
      dueDate = new Date(task.dueDate);
      if (isNaN(dueDate.getTime())) {
        throw new Error('Invalid date');
      }
    } catch {
      // Fallback to 2 weeks from now
      dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);
    }

    return {
      title: task.title,
      type: task.type,
      courseId,
      dueDate,
      complexity: task.complexity,
      estimatedHours: Math.max(0.5, task.estimatedHours),
      isHardDeadline: task.type === 'exam' || task.title.toLowerCase().includes('final'),
      bufferPercentage: task.type === 'exam' ? 10 : 20,
      status: 'not-started',
      description: task.description
    };
  });
}

/**
 * Extract patterns from text for ML training
 */
function extractPatterns(text: string, type: 'date' | 'task' | 'course'): string[] {
  const patterns: string[] = [];
  
  switch (type) {
    case 'date':
      // Extract date-like patterns
      const dateRegex = /\b\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}\b|\b\w+\s+\d{1,2},?\s+\d{4}\b|\bdue:?\s*[^\n]+/gi;
      const dates = text.match(dateRegex);
      if (dates) patterns.push(...dates.slice(0, 5));
      break;
      
    case 'task':
      // Extract task indicators
      const taskRegex = /\b(assignment|homework|hw|quiz|exam|test|midterm|final|project|paper|essay|reading|chapter|lab|exercise|problem set)s?\b/gi;
      const tasks = text.match(taskRegex);
      if (tasks) patterns.push(...Array.from(new Set(tasks)).slice(0, 10));
      break;
      
    case 'course':
      // Extract course codes and names
      const courseRegex = /\b[A-Z]{2,4}[\s-]?\d{3,4}[A-Z]?\b|\b(NURS|CS|MATH|PHYS|CHEM|BIO|ENG|HIST)\b/g;
      const courses = text.match(courseRegex);
      if (courses) patterns.push(...Array.from(new Set(courses)).slice(0, 5));
      break;
  }
  
  return patterns;
}