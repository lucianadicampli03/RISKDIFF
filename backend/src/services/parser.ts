import fs from 'fs/promises';
import pdfParse from 'pdf-parse';

export interface Clause {
  id: string;
  title: string;
  content: string;
  sectionNumber?: string;
  startIndex: number;
  endIndex: number;
}

export interface ParsedDocument {
  text: string;
  clauses: Clause[];
  metadata: {
    title?: string;
    totalPages?: number;
  };
}

/**
 * Parse a document (PDF or TXT) into structured clauses
 */
export async function parseDocument(filePath: string, mimeType: string): Promise<ParsedDocument> {
  let text: string;
  let metadata: { title?: string; totalPages?: number } = {};

  if (mimeType === 'application/pdf') {
    const dataBuffer = await fs.readFile(filePath);
    const pdfData = await pdfParse(dataBuffer);
    text = pdfData.text;
    metadata.totalPages = pdfData.numpages;
    metadata.title = pdfData.info?.Title;
  } else {
    text = await fs.readFile(filePath, 'utf-8');
  }

  // Extract clauses using heuristic-based approach
  const clauses = extractClauses(text);

  return {
    text,
    clauses,
    metadata,
  };
}

/**
 * Extract clauses from document text using pattern matching
 * Looks for numbered sections, headings, etc.
 */
function extractClauses(text: string): Clause[] {
  const clauses: Clause[] = [];
  
  // Common patterns for legal document sections:
  // 1. Section N, 2. Article N, 3. N., 4. N.N, etc.
  const sectionPattern = /(?:^|\n)(?:Section|Article|Clause)?\s*(\d+(?:\.\d+)*)[.:\s]+([^\n]+)/gi;
  
  let match;
  let lastIndex = 0;
  let clauseId = 0;

  while ((match = sectionPattern.exec(text)) !== null) {
    const sectionNumber = match[1];
    const title = match[2].trim();
    const startIndex = match.index;

    // If we have a previous clause, set its end index
    if (clauses.length > 0) {
      clauses[clauses.length - 1].endIndex = startIndex;
    }

    clauses.push({
      id: `clause-${clauseId++}`,
      title,
      sectionNumber,
      content: '', // Will be filled when we know the end
      startIndex,
      endIndex: text.length, // Temporary, will be updated
    });
  }

  // Extract content for each clause
  for (let i = 0; i < clauses.length; i++) {
    const clause = clauses[i];
    const nextStartIndex = i < clauses.length - 1 ? clauses[i + 1].startIndex : text.length;
    clause.content = text.substring(clause.startIndex, nextStartIndex).trim();
    clause.endIndex = nextStartIndex;
  }

  // If no structured clauses found, create a single clause with all content
  if (clauses.length === 0) {
    clauses.push({
      id: 'clause-0',
      title: 'Full Document',
      content: text.trim(),
      startIndex: 0,
      endIndex: text.length,
    });
  }

  return clauses;
}

/**
 * Identify important economic and risk-relevant keywords
 */
export function identifyClauseType(clause: Clause): string[] {
  const content = (clause.title + ' ' + clause.content).toLowerCase();
  const types: string[] = [];

  const patterns = {
    'Interest Rate': /interest rate|apr|annual percentage|interest calculation/i,
    'Payment Terms': /payment|installment|amortization|due date/i,
    'Principal': /principal amount|loan amount|borrowed amount/i,
    'Collateral': /collateral|security|pledge|lien/i,
    'Default': /default|breach|event of default|failure to pay/i,
    'Covenants': /covenant|undertaking|affirmative covenant|negative covenant/i,
    'Representations': /represent|warranty|representation and warrant/i,
    'Maturity': /maturity|maturity date|term of loan|loan period/i,
    'Prepayment': /prepayment|early payment|voluntary prepayment/i,
    'Fees': /fee|charge|cost|expense/i,
    'Governing Law': /governing law|jurisdiction|applicable law/i,
    'Amendment': /amendment|modification|change|alter/i,
  };

  for (const [type, pattern] of Object.entries(patterns)) {
    if (pattern.test(content)) {
      types.push(type);
    }
  }

  return types.length > 0 ? types : ['General'];
}
