import React, { useRef } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { generateReportPDF } from '../../utils/generateReportPDF';

interface PrintReportButtonProps {
  reportRef: React.RefObject<HTMLDivElement>;
  reportType: string;
  className?: string;
}

const PrintReportButton: React.FC<PrintReportButtonProps> = ({
  reportRef,
  reportType,
  className = '',
}) => {
  const [isGenerating, setIsGenerating] = React.useState(false);

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    
    setIsGenerating(true);
    
    try {
      await generateReportPDF(reportRef.current, reportType);
    } catch (error) {
      console.error('Error exporting report to PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  return (
    <button
      onClick={handleExportPDF}
      disabled={isGenerating}
      className={`px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center print-hide ${className} ${isGenerating ? 'opacity-70 cursor-not-allowed' : ''}`}
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Generating PDF...
        </>
      ) : (
        <>
          <Download className="h-4 w-4 mr-2" />
          Export PDF
        </>
      )}
    </button>
  );
};

export default PrintReportButton;
