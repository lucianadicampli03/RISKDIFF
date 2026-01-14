import { X } from 'lucide-react';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { ClauseChange } from './ResultsDashboard';

interface ClauseDetailModalProps {
  clause: ClauseChange;
  onClose: () => void;
}

export function ClauseDetailModal({ clause, onClose }: ClauseDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-8 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between p-8 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50/30">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="px-4 py-1.5 bg-white rounded-lg shadow-sm border border-slate-200">
                <span className="text-slate-700">Clause {clause.clauseNumber}</span>
              </div>
              <Badge
                variant={
                  clause.changeType === 'added'
                    ? 'default'
                    : clause.changeType === 'removed'
                    ? 'destructive'
                    : 'secondary'
                }
                className={
                  clause.changeType === 'added'
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-sm'
                    : clause.changeType === 'removed'
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-sm'
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-sm'
                }
              >
                {clause.changeType === 'added' ? 'Added' : clause.changeType === 'removed' ? 'Removed' : 'Modified'}
              </Badge>
              <Badge
                variant={clause.riskLevel === 'high' ? 'destructive' : 'secondary'}
                className={
                  clause.riskLevel === 'high'
                    ? 'bg-red-100 text-red-800 hover:bg-red-100 border border-red-300'
                    : clause.riskLevel === 'medium'
                    ? 'bg-amber-100 text-amber-800 hover:bg-amber-100 border border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border border-emerald-300'
                }
              >
                {clause.riskLevel === 'high' ? 'High Risk' : clause.riskLevel === 'medium' ? 'Medium Risk' : 'Low Risk'}
              </Badge>
            </div>
            <h2 className="text-slate-900">{clause.clauseTitle}</h2>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-8">
          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* Before Column */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-4 h-4 rounded-full bg-red-500 shadow-sm"></div>
                <h3 className="text-slate-900">Original Agreement</h3>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100/50 border-2 border-red-200 rounded-xl p-8 min-h-[250px] shadow-sm">
                {clause.beforeText ? (
                  <p className="text-slate-900 leading-relaxed">{clause.beforeText}</p>
                ) : (
                  <p className="text-slate-500 italic">Clause not present in original agreement</p>
                )}
              </div>
            </div>

            {/* After Column */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-4 h-4 rounded-full bg-green-500 shadow-sm"></div>
                <h3 className="text-slate-900">Amended Agreement</h3>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100/50 border-2 border-green-200 rounded-xl p-8 min-h-[250px] shadow-sm">
                {clause.afterText ? (
                  <p className="text-slate-900 leading-relaxed">{clause.afterText}</p>
                ) : (
                  <p className="text-slate-500 italic">Clause removed in amended agreement</p>
                )}
              </div>
            </div>
          </div>

          {/* Impact Analysis */}
          <div className="border-t-2 border-slate-200 pt-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-4 h-4 rounded-full bg-blue-500 shadow-sm"></div>
              <h3 className="text-slate-900">Commercial Impact Analysis</h3>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-2 border-blue-200 rounded-xl p-8 shadow-sm">
              <div className="flex items-start gap-6 mb-6">
                <div className="flex-1">
                  <div className="text-slate-600 mb-3">Who Benefits</div>
                  <div className="inline-flex items-center gap-3 px-5 py-3 rounded-lg border-2 bg-white shadow-sm">
                    <span className="text-slate-900">
                      {clause.beneficiary === 'borrower' ? '👤 Borrower' : clause.beneficiary === 'lender' ? '🏦 Lender' : '⚖️ Neutral'}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-slate-600 mb-3">Risk Level</div>
                  <div className={`inline-flex px-5 py-3 rounded-lg border-2 shadow-sm ${
                    clause.riskLevel === 'high'
                      ? 'bg-red-100 border-red-300 text-red-800'
                      : clause.riskLevel === 'medium'
                      ? 'bg-amber-100 border-amber-300 text-amber-800'
                      : 'bg-emerald-100 border-emerald-300 text-emerald-800'
                  }`}>
                    {clause.riskLevel.toUpperCase()}
                  </div>
                </div>
              </div>
              <div className="text-slate-900 leading-relaxed bg-white rounded-lg p-6 border border-blue-200">
                {clause.explanation}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-slate-200 flex justify-end bg-gradient-to-r from-slate-50 to-blue-50/30">
          <Button
            onClick={onClose}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}