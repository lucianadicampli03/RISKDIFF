import OpenAI from 'openai';
import { ClauseComparison, DocumentComparison } from './diffEngine.js';

export type RiskLevel = 'Low' | 'Medium' | 'High';
export type Beneficiary = 'Borrower' | 'Lender' | 'Neutral';

export interface ExplainedChange extends ClauseComparison {
  explanation: string;
  riskLevel: RiskLevel;
  beneficiary: Beneficiary;
  impactSummary: string;
}

export interface ComparisonResults {
  changes: ExplainedChange[];
  summary: DocumentComparison['summary'];
  executiveSummary: string;
  riskBreakdown: {
    high: number;
    medium: number;
    low: number;
  };
  beneficiaryBreakdown: {
    borrower: number;
    lender: number;
    neutral: number;
  };
}

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const ollamaModel = process.env.OLLAMA_MODEL || 'llama3.1';

/**
 * Generate explanations for all changes
 */
export async function generateExplanations(
  comparison: DocumentComparison
): Promise<ComparisonResults> {
  const explainedChanges: ExplainedChange[] = [];

  // Only explain changes (not unchanged clauses)
  const relevantChanges = comparison.changes.filter(
    c => c.changeType !== 'unchanged'
  );

  // Process in batches to avoid rate limits
  const batchSize = 5;
  for (let i = 0; i < relevantChanges.length; i += batchSize) {
    const batch = relevantChanges.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(change => explainChange(change))
    );
    explainedChanges.push(...batchResults);
  }

  // Generate executive summary
  const executiveSummary = await generateExecutiveSummary(explainedChanges, comparison.summary);

  // Calculate breakdowns
  const riskBreakdown = {
    high: explainedChanges.filter(c => c.riskLevel === 'High').length,
    medium: explainedChanges.filter(c => c.riskLevel === 'Medium').length,
    low: explainedChanges.filter(c => c.riskLevel === 'Low').length,
  };

  const beneficiaryBreakdown = {
    borrower: explainedChanges.filter(c => c.beneficiary === 'Borrower').length,
    lender: explainedChanges.filter(c => c.beneficiary === 'Lender').length,
    neutral: explainedChanges.filter(c => c.beneficiary === 'Neutral').length,
  };

  return {
    changes: explainedChanges,
    summary: comparison.summary,
    executiveSummary,
    riskBreakdown,
    beneficiaryBreakdown,
  };
}

/**
 * Explain a single clause change
 */
async function explainChange(change: ClauseComparison): Promise<ExplainedChange> {
  // Prefer OpenAI if configured, otherwise try free local Ollama, then fallback
  if (!openai) {
    const ollamaResult = await tryOllamaExplanation(change);
    if (ollamaResult) {
      return ollamaResult;
    }
    return generateRuleBasedExplanation(change);
  }

  try {
    const prompt = buildExplanationPrompt(change);
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a financial analyst explaining loan agreement changes to banking professionals. Be concise, clear, and focus on economic and risk implications. Respond in JSON format.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const response = JSON.parse(completion.choices[0].message.content || '{}');

    return {
      ...change,
      explanation: response.explanation || 'Change detected in clause.',
      riskLevel: response.riskLevel || 'Medium',
      beneficiary: response.beneficiary || 'Neutral',
      impactSummary: response.impactSummary || 'Impact assessment pending.',
    };
  } catch (error) {
    console.error('Error generating AI explanation:', error);
    return generateRuleBasedExplanation(change);
  }
}

/**
 * Build prompt for LLM explanation
 */
function buildExplanationPrompt(change: ClauseComparison): string {
  let prompt = `Analyze this loan agreement change:\n\n`;
  prompt += `Change Type: ${change.changeType}\n`;
  prompt += `Clause Categories: ${change.clauseTypes.join(', ')}\n\n`;

  if (change.changeType === 'added') {
    prompt += `NEW CLAUSE:\n${change.amendedClause?.title}\n${change.amendedClause?.content?.substring(0, 500)}\n\n`;
  } else if (change.changeType === 'removed') {
    prompt += `REMOVED CLAUSE:\n${change.originalClause?.title}\n${change.originalClause?.content?.substring(0, 500)}\n\n`;
  } else if (change.changeType === 'modified') {
    prompt += `ORIGINAL:\n${change.originalClause?.title}\n${change.originalClause?.content?.substring(0, 300)}\n\n`;
    prompt += `AMENDED:\n${change.amendedClause?.title}\n${change.amendedClause?.content?.substring(0, 300)}\n\n`;
  }

  prompt += `Provide a JSON response with:\n`;
  prompt += `- explanation: 2-3 sentences explaining the change in plain English\n`;
  prompt += `- impactSummary: One sentence on commercial impact\n`;
  prompt += `- riskLevel: "Low", "Medium", or "High"\n`;
  prompt += `- beneficiary: "Borrower", "Lender", or "Neutral"\n`;

  return prompt;
}

/**
 * Try generating explanation using a local Ollama model (free, no API key).
 */
async function tryOllamaExplanation(
  change: ClauseComparison
): Promise<ExplainedChange | null> {
  try {
    const prompt = buildExplanationPrompt(change);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(`${ollamaBaseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: ollamaModel,
        stream: false,
        messages: [
          {
            role: 'system',
            content:
              'You are a financial analyst explaining loan agreement changes to banking professionals. Be concise, clear, and focus on economic and risk implications. Respond in JSON format.',
          },
          { role: 'user', content: prompt },
        ],
      }),
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const content = data?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content);

    return {
      ...change,
      explanation: parsed.explanation || 'Change detected in clause.',
      riskLevel: parsed.riskLevel || 'Medium',
      beneficiary: parsed.beneficiary || 'Neutral',
      impactSummary: parsed.impactSummary || 'Impact assessment pending.',
    };
  } catch (error) {
    return null;
  }
}

/**
 * Generate rule-based explanation (fallback when no LLM)
 */
function generateRuleBasedExplanation(change: ClauseComparison): ExplainedChange {
  let explanation = '';
  let riskLevel: RiskLevel = 'Medium';
  let beneficiary: Beneficiary = 'Neutral';
  let impactSummary = '';

  const isEconomic = change.clauseTypes.some(t => 
    ['Interest Rate', 'Payment Terms', 'Principal', 'Fees', 'Maturity'].includes(t)
  );

  const isRiskRelated = change.clauseTypes.some(t => 
    ['Default', 'Covenants', 'Collateral'].includes(t)
  );

  switch (change.changeType) {
    case 'added':
      explanation = `A new clause "${change.amendedClause?.title}" has been added to the agreement.`;
      impactSummary = isEconomic 
        ? 'This may affect the economic terms of the loan.' 
        : 'This adds new obligations or terms to the agreement.';
      riskLevel = isRiskRelated ? 'High' : 'Medium';
      beneficiary = isRiskRelated ? 'Lender' : 'Neutral';
      break;

    case 'removed':
      explanation = `The clause "${change.originalClause?.title}" has been removed from the agreement.`;
      impactSummary = isEconomic 
        ? 'This changes the economic structure of the loan.' 
        : 'This removes obligations or terms from the agreement.';
      riskLevel = isRiskRelated ? 'High' : 'Medium';
      beneficiary = isRiskRelated ? 'Borrower' : 'Neutral';
      break;

    case 'modified':
      explanation = `The clause "${change.amendedClause?.title}" has been modified with changes to its terms.`;
      impactSummary = isEconomic 
        ? 'This modifies the economic terms of the loan.' 
        : 'This alters existing obligations or terms.';
      
      // Determine risk based on similarity
      const similarity = change.similarity || 0.7;
      if (similarity < 0.7) {
        riskLevel = 'High';
      } else if (similarity < 0.85) {
        riskLevel = 'Medium';
      } else {
        riskLevel = 'Low';
      }
      
      beneficiary = 'Neutral';
      break;
  }

  // Adjust based on clause types
  if (change.clauseTypes.includes('Interest Rate')) {
    riskLevel = 'High';
    impactSummary = 'Direct impact on borrowing costs.';
  } else if (change.clauseTypes.includes('Default')) {
    riskLevel = 'High';
    impactSummary = 'Affects default triggers and remedies.';
  }

  return {
    ...change,
    explanation,
    riskLevel,
    beneficiary,
    impactSummary,
  };
}

/**
 * Generate executive summary of all changes
 */
async function generateExecutiveSummary(
  changes: ExplainedChange[],
  summary: DocumentComparison['summary']
): Promise<string> {
  const highRiskCount = changes.filter(c => c.riskLevel === 'High').length;
  const borrowerFavorable = changes.filter(c => c.beneficiary === 'Borrower').length;
  const lenderFavorable = changes.filter(c => c.beneficiary === 'Lender').length;

  let executiveSummary = `This amendment introduces ${summary.added + summary.modified + summary.removed} material changes to the loan agreement.`;

  if (highRiskCount > 0) {
    executiveSummary += ` ${highRiskCount} ${highRiskCount === 1 ? 'change is' : 'changes are'} classified as high-risk and require careful review.`;
  }

  if (borrowerFavorable > lenderFavorable) {
    executiveSummary += ` The amendment appears to favor the borrower with more flexible terms.`;
  } else if (lenderFavorable > borrowerFavorable) {
    executiveSummary += ` The amendment strengthens lender protections and tightens covenants.`;
  } else {
    executiveSummary += ` The changes appear balanced between borrower and lender interests.`;
  }

  // Highlight key change types
  const economicChanges = changes.filter(c => 
    c.clauseTypes.some(t => ['Interest Rate', 'Payment Terms', 'Principal', 'Fees'].includes(t))
  );

  if (economicChanges.length > 0) {
    executiveSummary += ` Note: ${economicChanges.length} ${economicChanges.length === 1 ? 'change affects' : 'changes affect'} economic terms.`;
  }

  return executiveSummary;
}
