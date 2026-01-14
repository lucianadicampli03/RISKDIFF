import { useEffect, useState } from 'react';
import { Loader2, FileSearch, Brain, CheckCircle2 } from 'lucide-react';

const statusMessages = [
  { text: 'Parsing clauses', icon: FileSearch },
  { text: 'Detecting material changes', icon: Brain },
  { text: 'Analyzing commercial impact', icon: CheckCircle2 },
];

export function ProcessingState() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % statusMessages.length);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const CurrentIcon = statusMessages[currentStep].icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-center justify-center">
      <div className="text-center">
        <div className="relative inline-block mb-10">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full blur-2xl opacity-30 animate-pulse"></div>
          <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-2xl shadow-blue-600/30">
            <Loader2 className="w-16 h-16 text-white animate-spin" />
          </div>
        </div>
        <h2 className="text-slate-900 mb-4">Processing Documents</h2>
        <div className="flex items-center justify-center gap-3 bg-white rounded-full px-6 py-3 shadow-lg border border-slate-200">
          <CurrentIcon className="w-5 h-5 text-blue-600 animate-pulse" />
          <p className="text-slate-700">
            {statusMessages[currentStep].text}
          </p>
        </div>
        
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {statusMessages.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentStep
                  ? 'w-8 bg-blue-600'
                  : 'w-2 bg-slate-300'
              }`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}