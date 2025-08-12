/**
 * Legacy Code Merger
 * Analyzes and extracts features from legacy HTML/JS files
 */

export interface LegacyFeature {
  name: string;
  description: string;
  code: string;
  type: 'algorithm' | 'ui' | 'data' | 'utility';
  complexity: 'low' | 'medium' | 'high';
  dependencies: string[];
  valueScore: number; // 1-10 how valuable this feature is
}

export class LegacyMerger {
  private features: LegacyFeature[] = [];
  
  /**
   * Analyze a legacy HTML file and extract features
   */
  analyzeLegacyFile(htmlContent: string, fileName: string): LegacyFeature[] {
    const extractedFeatures: LegacyFeature[] = [];
    
    // Extract scheduling algorithms
    const schedulingPatterns = [
      /function\s+(\w*[Ss]chedule\w*)\s*\([^)]*\)\s*{([^}]+)}/g,
      /const\s+(\w*[Ss]chedule\w*)\s*=\s*(?:function|\([^)]*\)\s*=>)\s*{([^}]+)}/g,
      /class\s+(\w*[Ss]chedule\w*)\s*{([^}]+)}/g
    ];
    
    for (const pattern of schedulingPatterns) {
      let match;
      while ((match = pattern.exec(htmlContent)) !== null) {
        extractedFeatures.push({
          name: match[1],
          description: `Scheduling algorithm from ${fileName}`,
          code: match[0],
          type: 'algorithm',
          complexity: this.assessComplexity(match[0]),
          dependencies: this.extractDependencies(match[0]),
          valueScore: this.assessSchedulingValue(match[0])
        });
      }
    }
    
    // Extract UI components
    const uiPatterns = [
      /<template[^>]*id=["']([^"']+)["'][^>]*>([\s\S]*?)<\/template>/g,
      /class\s+(\w*(?:Component|View|Modal|Card|Form)\w*)\s*{([^}]+)}/g,
      /function\s+(\w*(?:render|create|build)\w*)\s*\([^)]*\)\s*{([^}]+)}/g
    ];
    
    for (const pattern of uiPatterns) {
      let match;
      while ((match = pattern.exec(htmlContent)) !== null) {
        extractedFeatures.push({
          name: match[1],
          description: `UI component from ${fileName}`,
          code: match[0],
          type: 'ui',
          complexity: this.assessComplexity(match[0]),
          dependencies: this.extractDependencies(match[0]),
          valueScore: this.assessUIValue(match[0])
        });
      }
    }
    
    // Extract data management
    const dataPatterns = [
      /(?:localStorage|sessionStorage)\.(?:get|set)Item\(['"]([^'"]+)['"]/g,
      /class\s+(\w*(?:Store|State|Manager|Service)\w*)\s*{([^}]+)}/g,
      /const\s+(\w*(?:save|load|fetch|update|delete)\w*)\s*=/g
    ];
    
    for (const pattern of dataPatterns) {
      let match;
      while ((match = pattern.exec(htmlContent)) !== null) {
        extractedFeatures.push({
          name: match[1] || 'DataManagement',
          description: `Data management from ${fileName}`,
          code: match[0],
          type: 'data',
          complexity: this.assessComplexity(match[0]),
          dependencies: this.extractDependencies(match[0]),
          valueScore: this.assessDataValue(match[0])
        });
      }
    }
    
    // Extract unique algorithms
    const algorithmIndicators = [
      'prioritize', 'optimize', 'balance', 'distribute',
      'calculate', 'analyze', 'predict', 'estimate',
      'conflict', 'resolution', 'weight', 'score'
    ];
    
    algorithmIndicators.forEach(indicator => {
      const pattern = new RegExp(
        `function\\s+(\\w*${indicator}\\w*)\\s*\\([^)]*\\)\\s*{([^}]+)}`,
        'gi'
      );
      let match;
      while ((match = pattern.exec(htmlContent)) !== null) {
        if (!extractedFeatures.some(f => f.name === match[1])) {
          extractedFeatures.push({
            name: match[1],
            description: `Algorithm: ${indicator} from ${fileName}`,
            code: match[0],
            type: 'algorithm',
            complexity: this.assessComplexity(match[0]),
            dependencies: this.extractDependencies(match[0]),
            valueScore: this.assessAlgorithmValue(match[0], indicator)
          });
        }
      }
    });
    
    this.features.push(...extractedFeatures);
    return extractedFeatures;
  }
  
  /**
   * Compare features with current implementation
   */
  compareWithCurrent(): {
    unique: LegacyFeature[];
    improved: LegacyFeature[];
    redundant: LegacyFeature[];
  } {
    const unique: LegacyFeature[] = [];
    const improved: LegacyFeature[] = [];
    const redundant: LegacyFeature[] = [];
    
    this.features.forEach(feature => {
      // Check if feature exists in current codebase
      const existsInCurrent = this.checkIfExists(feature);
      
      if (!existsInCurrent) {
        unique.push(feature);
      } else if (this.isBetterImplementation(feature)) {
        improved.push(feature);
      } else {
        redundant.push(feature);
      }
    });
    
    return { unique, improved, redundant };
  }
  
  /**
   * Generate React component from legacy code
   */
  convertToReact(feature: LegacyFeature): string {
    let reactCode = '';
    
    if (feature.type === 'ui') {
      reactCode = this.convertUIToReact(feature.code);
    } else if (feature.type === 'algorithm') {
      reactCode = this.wrapAlgorithmInHook(feature.code);
    } else if (feature.type === 'data') {
      reactCode = this.convertToZustandStore(feature.code);
    }
    
    return reactCode;
  }
  
  /**
   * Merge selected features into current app
   */
  generateMergeCode(selectedFeatures: LegacyFeature[]): {
    components: string[];
    hooks: string[];
    utilities: string[];
    stores: string[];
  } {
    const result = {
      components: [],
      hooks: [],
      utilities: [],
      stores: []
    };
    
    selectedFeatures.forEach(feature => {
      const reactCode = this.convertToReact(feature);
      
      switch (feature.type) {
        case 'ui':
          result.components.push(reactCode);
          break;
        case 'algorithm':
          result.hooks.push(reactCode);
          break;
        case 'data':
          result.stores.push(reactCode);
          break;
        case 'utility':
          result.utilities.push(reactCode);
          break;
      }
    });
    
    return result;
  }
  
  // Helper methods
  
  private assessComplexity(code: string): 'low' | 'medium' | 'high' {
    const lines = code.split('\n').length;
    const loops = (code.match(/(?:for|while|do)\s*\(/g) || []).length;
    const conditions = (code.match(/if\s*\(/g) || []).length;
    
    const score = lines / 10 + loops * 2 + conditions;
    
    if (score < 5) return 'low';
    if (score < 15) return 'medium';
    return 'high';
  }
  
  private extractDependencies(code: string): string[] {
    const deps: string[] = [];
    
    // Check for library dependencies
    if (code.includes('jQuery') || code.includes('$')) deps.push('jquery');
    if (code.includes('moment')) deps.push('moment');
    if (code.includes('axios')) deps.push('axios');
    if (code.includes('lodash') || code.includes('_')) deps.push('lodash');
    
    return deps;
  }
  
  private assessSchedulingValue(code: string): number {
    let score = 5; // Base score
    
    // Check for advanced features
    if (code.includes('priority')) score += 2;
    if (code.includes('conflict')) score += 2;
    if (code.includes('optimize')) score += 3;
    if (code.includes('weight')) score += 2;
    if (code.includes('energy')) score += 2;
    if (code.includes('preference')) score += 1;
    
    return Math.min(10, score);
  }
  
  private assessUIValue(code: string): number {
    let score = 5;
    
    if (code.includes('animation') || code.includes('transition')) score += 2;
    if (code.includes('responsive') || code.includes('@media')) score += 2;
    if (code.includes('accessibility') || code.includes('aria-')) score += 2;
    if (code.includes('drag') || code.includes('drop')) score += 2;
    
    return Math.min(10, score);
  }
  
  private assessDataValue(code: string): number {
    let score = 5;
    
    if (code.includes('cache')) score += 2;
    if (code.includes('sync')) score += 2;
    if (code.includes('validation')) score += 1;
    if (code.includes('encryption')) score += 2;
    
    return Math.min(10, score);
  }
  
  private assessAlgorithmValue(code: string, type: string): number {
    const baseScores: Record<string, number> = {
      'prioritize': 8,
      'optimize': 9,
      'balance': 7,
      'distribute': 7,
      'calculate': 6,
      'analyze': 8,
      'predict': 9,
      'estimate': 6,
      'conflict': 8,
      'resolution': 8,
      'weight': 7,
      'score': 6
    };
    
    return baseScores[type] || 5;
  }
  
  private checkIfExists(feature: LegacyFeature): boolean {
    // This would check against current codebase
    // For now, return false for all unique features
    return false;
  }
  
  private isBetterImplementation(feature: LegacyFeature): boolean {
    // Compare complexity and value score
    return feature.valueScore > 7 && feature.complexity !== 'high';
  }
  
  private convertUIToReact(code: string): string {
    // Basic conversion template
    return `
import React from 'react';

const LegacyComponent: React.FC = () => {
  // Legacy code converted
  ${code.replace(/function\s+\w+\s*\([^)]*\)\s*{/, 'const handleAction = () => {')}
  
  return (
    <div>
      {/* Converted UI */}
    </div>
  );
};

export default LegacyComponent;
`;
  }
  
  private wrapAlgorithmInHook(code: string): string {
    return `
import { useCallback } from 'react';

export const useLegacyAlgorithm = () => {
  const algorithm = useCallback(() => {
    ${code}
  }, []);
  
  return { algorithm };
};
`;
  }
  
  private convertToZustandStore(code: string): string {
    return `
import { create } from 'zustand';

export const useLegacyStore = create((set, get) => ({
  // Legacy data management
  ${code}
}));
`;
  }
}

export const legacyMerger = new LegacyMerger();