import { useMemo, useState } from 'react';
import { UploadScreen } from '@/app/components/UploadScreen';
import { ProcessingState } from '@/app/components/ProcessingState';
import { ResultsDashboard, ClauseChange } from '@/app/components/ResultsDashboard';
import { ClauseDetailModal } from '@/app/components/ClauseDetailModal';

type AppState = 'upload' | 'processing' | 'results';

interface Clause {
  id: string;
  title: string;
  content: string;
  sectionNumber?: string;
}

interface ExplainedChange {
  id: string;
  changeType: 'added' | 'removed' | 'modified' | 'unchanged';
  originalClause?: Clause;
  amendedClause?: Clause;
  similarity?: number;
  clauseTypes: string[];
  explanation: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  beneficiary: 'Borrower' | 'Lender' | 'Neutral';
  impactSummary: string;
}

interface ComparisonResults {
  changes: ExplainedChange[];
  summary: {
    totalClauses: number;
    added: number;
    removed: number;
    modified: number;
    unchanged: number;
  };
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

export default function App() {
  const [appState, setAppState] = useState<AppState>('upload');
  const [selectedClause, setSelectedClause] = useState<ClauseChange | null>(null);
  const [results, setResults] = useState<ComparisonResults | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCompare = async (files: { original: File; amended: File }) => {
    setErrorMessage(null);
    setAppState('processing');

    try {
      const formData = new FormData();
      formData.append('original', files.original);
      formData.append('amended', files.amended);

      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const response = await fetch(`${apiBaseUrl}/api/compare`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null);
        throw new Error(
          errorPayload?.message ||
            errorPayload?.error ||
            'Failed to analyze documents. Please try again.'
        );
      }

      const data = (await response.json()) as ComparisonResults;
      setResults(data);
      setAppState('results');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to analyze documents.');
      setAppState('upload');
    }
  };

  const handleBack = () => {
    setAppState('upload');
    setSelectedClause(null);
  };

  const handleClauseClick = (clause: ClauseChange) => {
    setSelectedClause(clause);
  };

  const handleCloseModal = () => {
    setSelectedClause(null);
  };

  const mappedChanges = useMemo<ClauseChange[]>(() => {
    if (!results) return [];
    return results.changes
      .filter((change) => change.changeType !== 'unchanged')
      .map((change, index) => ({
        id: change.id || `change-${index}`,
        clauseNumber:
          change.amendedClause?.sectionNumber ||
          change.originalClause?.sectionNumber ||
          '—',
        clauseTitle:
          change.amendedClause?.title || change.originalClause?.title || 'Untitled Clause',
        changeType: change.changeType as 'added' | 'removed' | 'modified',
        riskLevel: change.riskLevel.toLowerCase() as 'low' | 'medium' | 'high',
        beneficiary: change.beneficiary.toLowerCase() as 'borrower' | 'lender' | 'neutral',
        beforeText: change.originalClause?.content || '',
        afterText: change.amendedClause?.content || '',
        explanation: change.explanation || change.impactSummary || 'Change detected.',
        clauseTypes: change.clauseTypes || [],
      }));
  }, [results]);

  return (
    <>
      {appState === 'upload' && (
        <UploadScreen onCompare={handleCompare} errorMessage={errorMessage} />
      )}
      {appState === 'processing' && <ProcessingState />}
      {appState === 'results' && results && (
        <ResultsDashboard
          onBack={handleBack}
          onClauseClick={handleClauseClick}
          changes={mappedChanges}
          executiveSummary={results.executiveSummary}
        />
      )}
      {selectedClause && (
        <ClauseDetailModal clause={selectedClause} onClose={handleCloseModal} />
      )}
    </>
  );
}
