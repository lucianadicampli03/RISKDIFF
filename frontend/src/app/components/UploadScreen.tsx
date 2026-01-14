import { useState } from 'react';
import { FileText, Upload } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

interface UploadScreenProps {
  onCompare: (files: { original: File; amended: File }) => void;
  errorMessage?: string | null;
}

export function UploadScreen({ onCompare, errorMessage }: UploadScreenProps) {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [amendedFile, setAmendedFile] = useState<File | null>(null);

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    setter: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setter(file);
    }
  };

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setter(file);
    }
  };

  const canCompare = originalFile && amendedFile;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 px-8 py-6 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-600/20">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-slate-900">Amendment Insight Engine</h1>
          </div>
          <p className="text-slate-600 ml-[52px]">
            Compare loan agreements and understand material changes instantly
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="max-w-6xl w-full">
          {/* Upload Panels */}
          <div className="grid grid-cols-2 gap-8 mb-10">
            {/* Original Agreement Upload */}
            <UploadPanel
              title="Original Loan Agreement"
              file={originalFile}
              onDrop={(e) => handleDrop(e, setOriginalFile)}
              onFileSelect={(e) => handleFileSelect(e, setOriginalFile)}
              onClear={() => setOriginalFile(null)}
            />

            {/* Amended Agreement Upload */}
            <UploadPanel
              title="Amended / Restated Agreement"
              file={amendedFile}
              onDrop={(e) => handleDrop(e, setAmendedFile)}
              onFileSelect={(e) => handleFileSelect(e, setAmendedFile)}
              onClear={() => setAmendedFile(null)}
            />
          </div>

          {/* Helper Text */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-6 py-3">
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
              <p className="text-blue-900">
                Automatically highlights material changes and explains commercial impact
              </p>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-6 flex justify-center">
              <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-3 rounded-lg shadow-sm">
                {errorMessage}
              </div>
            </div>
          )}

          {/* Compare Button */}
          <div className="flex justify-center">
            <Button
              onClick={() => {
                if (originalFile && amendedFile) {
                  onCompare({ original: originalFile, amended: amendedFile });
                }
              }}
              disabled={!canCompare}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-16 py-7 h-auto disabled:bg-slate-300 disabled:text-slate-500 disabled:from-slate-300 disabled:to-slate-300 shadow-xl shadow-blue-600/25 hover:shadow-2xl hover:shadow-blue-600/30 transition-all duration-200 hover:scale-105"
            >
              <span className="mr-2">Compare Documents</span>
              <span className="text-blue-200">→</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface UploadPanelProps {
  title: string;
  file: File | null;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
}

function UploadPanel({ title, file, onDrop, onFileSelect, onClear }: UploadPanelProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-blue-400 rounded-full"></div>
        <h3 className="text-slate-900">{title}</h3>
      </div>
      
      <div
        onDrop={(e) => {
          onDrop(e);
          setIsDragOver(false);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        className={`
          border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200
          ${isDragOver ? 'border-blue-500 bg-blue-50 scale-[1.02]' : 'border-slate-300 bg-gradient-to-br from-slate-50 to-slate-100/50'}
          ${file ? 'bg-gradient-to-br from-blue-50 to-slate-50' : ''}
        `}
      >
        {!file ? (
          <label className="cursor-pointer block">
            <input
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              onChange={onFileSelect}
              className="hidden"
            />
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mb-5 shadow-sm">
                <Upload className="w-9 h-9 text-slate-600" />
              </div>
              <p className="text-slate-900 mb-2">
                Drop file here or click to upload
              </p>
              <p className="text-slate-500">
                Supports PDF, DOCX, TXT
              </p>
            </div>
          </label>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-5 shadow-lg shadow-blue-500/30">
              <FileText className="w-9 h-9 text-white" />
            </div>
            <p className="text-slate-900 mb-1">
              {file.name}
            </p>
            <p className="text-slate-500 mb-5">
              {(file.size / 1024).toFixed(2)} KB
            </p>
            <Button
              onClick={onClear}
              variant="outline"
              size="sm"
              className="border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400"
            >
              Remove
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}