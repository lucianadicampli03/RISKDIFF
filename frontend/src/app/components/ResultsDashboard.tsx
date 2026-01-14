import { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, FileText, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { ScrollArea } from '@/app/components/ui/scroll-area';

export interface ClauseChange {
  id: string;
  clauseNumber: string;
  clauseTitle: string;
  changeType: 'added' | 'removed' | 'modified';
  riskLevel: 'low' | 'medium' | 'high';
  beneficiary: 'borrower' | 'lender' | 'neutral';
  beforeText: string;
  afterText: string;
  explanation: string;
  clauseTypes?: string[];
}

interface ResultsDashboardProps {
  onBack: () => void;
  onClauseClick: (clause: ClauseChange) => void;
  changes: ClauseChange[];
  executiveSummary: string;
}

export function ResultsDashboard({ onBack, onClauseClick, changes, executiveSummary }: ResultsDashboardProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // Calculate metrics
  const totalChanges = changes.length;
  const highRiskChanges = changes.filter((c) => c.riskLevel === 'high').length;
  const borrowerFavorable = changes.filter((c) => c.beneficiary === 'borrower').length;
  const lenderFavorable = changes.filter((c) => c.beneficiary === 'lender').length;

  const isEconomicChange = (change: ClauseChange) => {
    const types = (change.clauseTypes || []).map((type) => type.toLowerCase());
    if (types.length > 0) {
      return types.some((type) =>
        ['interest rate', 'payment terms', 'principal', 'fees', 'maturity', 'prepayment'].includes(type)
      );
    }
    const title = change.clauseTitle.toLowerCase();
    return title.includes('interest') || title.includes('payment') || title.includes('financial');
  };

  const isCovenantChange = (change: ClauseChange) => {
    const types = (change.clauseTypes || []).map((type) => type.toLowerCase());
    if (types.length > 0) {
      return types.includes('covenants');
    }
    return change.clauseTitle.toLowerCase().includes('covenant');
  };

  // Filter changes
  const filteredChanges = changes.filter((change) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'high-risk') return change.riskLevel === 'high';
    if (selectedFilter === 'economic') return isEconomicChange(change);
    if (selectedFilter === 'covenant') return isCovenantChange(change);
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 px-8 py-5 shadow-sm">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-600/20">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-slate-900">Analysis Results</h1>
              <p className="text-slate-600">
                Loan Amendment Comparison
              </p>
            </div>
          </div>
          <Button
            onClick={onBack}
            variant="outline"
            className="border-slate-300 text-slate-700 hover:bg-slate-100 shadow-sm"
          >
            New Comparison
          </Button>
        </div>
      </header>

      {/* Summary Bar */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-slate-200/60 px-8 py-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="grid grid-cols-4 gap-6 mb-6">
            <MetricCard
              label="Total Clauses Changed"
              value={totalChanges.toString()}
              icon={<FileText className="w-5 h-5 text-blue-600" />}
            />
            <MetricCard
              label="High-Risk Changes"
              value={highRiskChanges.toString()}
              icon={<AlertTriangle className="w-5 h-5 text-red-600" />}
              variant="danger"
            />
            <MetricCard
              label="Borrower-Favorable"
              value={borrowerFavorable.toString()}
              icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
              variant="success"
            />
            <MetricCard
              label="Lender-Favorable"
              value={lenderFavorable.toString()}
              icon={<TrendingDown className="w-5 h-5 text-amber-600" />}
              variant="warning"
            />
          </div>

          {/* Executive Summary */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white/90 mb-1">Executive Summary</p>
                <p className="text-white">
                  {executiveSummary}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-8 py-6">
        <div className="max-w-[1600px] mx-auto flex gap-6 h-full">
          {/* Sidebar Filters */}
          <aside className="w-64 flex-shrink-0">
            <Card className="bg-white p-6 shadow-lg border-slate-200">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-blue-400 rounded-full"></div>
                <h3 className="text-slate-900">Filters</h3>
              </div>
              <div className="space-y-2">
                <FilterButton
                  label="All Changes"
                  count={changes.length}
                  isActive={selectedFilter === 'all'}
                  onClick={() => setSelectedFilter('all')}
                />
                <FilterButton
                  label="High Risk Only"
                  count={highRiskChanges}
                  isActive={selectedFilter === 'high-risk'}
                  onClick={() => setSelectedFilter('high-risk')}
                />
                <FilterButton
                  label="Economic Changes"
                  count={changes.filter(isEconomicChange).length}
                  isActive={selectedFilter === 'economic'}
                  onClick={() => setSelectedFilter('economic')}
                />
                <FilterButton
                  label="Covenant Changes"
                  count={changes.filter(isCovenantChange).length}
                  isActive={selectedFilter === 'covenant'}
                  onClick={() => setSelectedFilter('covenant')}
                />
              </div>
            </Card>
          </aside>

          {/* Clause Changes List */}
          <div className="flex-1">
            <ScrollArea className="h-[calc(100vh-220px)]">
              <div className="space-y-4 pr-4">
                {filteredChanges.map((change) => (
                  <ClauseChangeCard
                    key={change.id}
                    change={change}
                    onClick={() => onClauseClick(change)}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  variant?: 'default' | 'danger' | 'success' | 'warning';
}

function MetricCard({ label, value, icon, variant = 'default' }: MetricCardProps) {
  const variants = {
    default: 'bg-white border-slate-200',
    danger: 'bg-gradient-to-br from-red-50 to-red-100/50 border-red-200 shadow-red-100',
    success: 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200 shadow-emerald-100',
    warning: 'bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200 shadow-amber-100',
  };

  return (
    <Card className={`p-6 shadow-lg hover:shadow-xl transition-all duration-200 ${variants[variant]}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-slate-600">{label}</span>
        <div className="p-2 rounded-lg bg-white/80 shadow-sm">
          {icon}
        </div>
      </div>
      <div className="text-slate-900">{value}</div>
    </Card>
  );
}

interface FilterButtonProps {
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
}

function FilterButton({ label, count, isActive, onClick }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left px-3 py-2 rounded-md transition-colors
        ${isActive ? 'bg-blue-100 text-blue-900' : 'text-slate-700 hover:bg-slate-100'}
      `}
    >
      <div className="flex items-center justify-between">
        <span>{label}</span>
        <span className={`text-sm ${isActive ? 'text-blue-700' : 'text-slate-500'}`}>
          {count}
        </span>
      </div>
    </button>
  );
}

interface ClauseChangeCardProps {
  change: ClauseChange;
  onClick: () => void;
}

function ClauseChangeCard({ change, onClick }: ClauseChangeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="bg-white p-6 hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
      {/* Card Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="px-3 py-1 bg-slate-100 rounded-md">
              <span className="text-slate-700">Clause {change.clauseNumber}</span>
            </div>
            <Badge
              variant={
                change.changeType === 'added'
                  ? 'default'
                  : change.changeType === 'removed'
                  ? 'destructive'
                  : 'secondary'
              }
              className={
                change.changeType === 'added'
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-sm'
                  : change.changeType === 'removed'
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-sm'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-sm'
              }
            >
              {change.changeType === 'added' ? 'Added' : change.changeType === 'removed' ? 'Removed' : 'Modified'}
            </Badge>
            <Badge
              variant={change.riskLevel === 'high' ? 'destructive' : 'secondary'}
              className={
                change.riskLevel === 'high'
                  ? 'bg-red-100 text-red-800 hover:bg-red-100 border border-red-300'
                  : change.riskLevel === 'medium'
                  ? 'bg-amber-100 text-amber-800 hover:bg-amber-100 border border-amber-300'
                  : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border border-emerald-300'
              }
            >
              {change.riskLevel === 'high' ? 'High Risk' : change.riskLevel === 'medium' ? 'Medium Risk' : 'Low Risk'}
            </Badge>
          </div>
          <h3 className="text-slate-900">{change.clauseTitle}</h3>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <BeneficiaryBadge beneficiary={change.beneficiary} />
        </div>
      </div>

      {/* Expandable Section */}
      <div className="border-t border-slate-200 pt-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
          <span>{isExpanded ? 'Hide' : 'Show'} Details</span>
        </button>

        {isExpanded && (
          <div className="space-y-4 mt-4">
            {/* Before Text */}
            {change.beforeText && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-slate-700">Before</span>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-100/50 border-l-4 border-red-400 rounded-lg p-4 text-slate-900 leading-relaxed">
                  {change.beforeText}
                </div>
              </div>
            )}

            {/* After Text */}
            {change.afterText && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-slate-700">After</span>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100/50 border-l-4 border-green-400 rounded-lg p-4 text-slate-900 leading-relaxed">
                  {change.afterText}
                </div>
              </div>
            )}

            {/* Explanation */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-slate-700">Impact Analysis</span>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-l-4 border-blue-400 rounded-lg p-4 text-slate-900 leading-relaxed">
                {change.explanation}
              </div>
            </div>

            <Button
              onClick={onClick}
              variant="outline"
              size="sm"
              className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 shadow-sm"
            >
              View Full Comparison
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}

interface BeneficiaryBadgeProps {
  beneficiary: 'borrower' | 'lender' | 'neutral';
}

function BeneficiaryBadge({ beneficiary }: BeneficiaryBadgeProps) {
  const config = {
    borrower: {
      label: 'Borrower',
      icon: <TrendingUp className="w-4 h-4" />,
      className: 'bg-green-100 text-green-800 border-green-200',
    },
    lender: {
      label: 'Lender',
      icon: <TrendingDown className="w-4 h-4" />,
      className: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    neutral: {
      label: 'Neutral',
      icon: <Minus className="w-4 h-4" />,
      className: 'bg-slate-100 text-slate-800 border-slate-200',
    },
  };

  const { label, icon, className } = config[beneficiary];

  return (
    <div className={`flex items-center gap-1 px-3 py-1 rounded-md border ${className}`}>
      {icon}
      <span>{label}</span>
    </div>
  );
}