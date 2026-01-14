import { Clause, ParsedDocument, identifyClauseType } from './parser.js';

export type ChangeType = 'added' | 'removed' | 'modified' | 'unchanged';

export interface ClauseComparison {
  id: string;
  changeType: ChangeType;
  originalClause?: Clause;
  amendedClause?: Clause;
  similarity?: number;
  clauseTypes: string[];
}

export interface DocumentComparison {
  changes: ClauseComparison[];
  summary: {
    totalClauses: number;
    added: number;
    removed: number;
    modified: number;
    unchanged: number;
  };
}

/**
 * Compare two parsed documents and identify changes
 */
export async function compareDocuments(
  original: ParsedDocument,
  amended: ParsedDocument
): Promise<DocumentComparison> {
  const changes: ClauseComparison[] = [];
  const usedAmendedIndices = new Set<number>();

  // First pass: Find matching and modified clauses
  for (const origClause of original.clauses) {
    let bestMatch: { clause: Clause; index: number; similarity: number } | null = null;

    for (let i = 0; i < amended.clauses.length; i++) {
      if (usedAmendedIndices.has(i)) continue;

      const amendClause = amended.clauses[i];
      const similarity = calculateSimilarity(origClause, amendClause);

      if (!bestMatch || similarity > bestMatch.similarity) {
        bestMatch = { clause: amendClause, index: i, similarity };
      }
    }

    // Determine if it's a match, modification, or removal
    if (bestMatch && bestMatch.similarity > 0.6) {
      usedAmendedIndices.add(bestMatch.index);
      
      const changeType: ChangeType = bestMatch.similarity > 0.95 ? 'unchanged' : 'modified';
      const clauseTypes = identifyClauseType(bestMatch.clause);

      changes.push({
        id: `change-${changes.length}`,
        changeType,
        originalClause: origClause,
        amendedClause: bestMatch.clause,
        similarity: bestMatch.similarity,
        clauseTypes,
      });
    } else {
      // No good match found - clause was removed
      const clauseTypes = identifyClauseType(origClause);
      changes.push({
        id: `change-${changes.length}`,
        changeType: 'removed',
        originalClause: origClause,
        clauseTypes,
      });
    }
  }

  // Second pass: Find newly added clauses
  for (let i = 0; i < amended.clauses.length; i++) {
    if (!usedAmendedIndices.has(i)) {
      const amendClause = amended.clauses[i];
      const clauseTypes = identifyClauseType(amendClause);
      
      changes.push({
        id: `change-${changes.length}`,
        changeType: 'added',
        amendedClause: amendClause,
        clauseTypes,
      });
    }
  }

  // Calculate summary
  const summary = {
    totalClauses: changes.length,
    added: changes.filter(c => c.changeType === 'added').length,
    removed: changes.filter(c => c.changeType === 'removed').length,
    modified: changes.filter(c => c.changeType === 'modified').length,
    unchanged: changes.filter(c => c.changeType === 'unchanged').length,
  };

  return { changes, summary };
}

/**
 * Calculate similarity between two clauses using simple text comparison
 */
function calculateSimilarity(clause1: Clause, clause2: Clause): number {
  // Simple approach: compare titles and section numbers first
  const titleSimilarity = stringSimilarity(
    clause1.title.toLowerCase(),
    clause2.title.toLowerCase()
  );

  const sectionMatch = clause1.sectionNumber === clause2.sectionNumber ? 1 : 0;

  // Compare content using word overlap
  const contentSimilarity = stringSimilarity(
    clause1.content.toLowerCase(),
    clause2.content.toLowerCase()
  );

  // Weighted average
  return titleSimilarity * 0.4 + sectionMatch * 0.2 + contentSimilarity * 0.4;
}

/**
 * Simple string similarity using word overlap (Jaccard similarity)
 */
function stringSimilarity(str1: string, str2: string): number {
  const words1 = new Set(str1.split(/\s+/).filter(w => w.length > 2));
  const words2 = new Set(str2.split(/\s+/).filter(w => w.length > 2));

  const intersection = new Set([...words1].filter(w => words2.has(w)));
  const union = new Set([...words1, ...words2]);

  return union.size === 0 ? 0 : intersection.size / union.size;
}
