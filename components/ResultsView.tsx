import React from 'react';
import ReactMarkdown from 'react-markdown';
import { AnalysisResult, SimplifiedReport, RiskReport } from '../types';
import { 
  Share2, BookOpen, AlertTriangle, Lightbulb, 
  CheckCircle2, Clock, Activity, User, ShieldCheck, Flame, Stethoscope, Utensils
} from 'lucide-react';

interface ResultsViewProps {
  result: AnalysisResult;
  onClose: () => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({ result, onClose }) => {
  const renderContent = () => {
    try {
      // ---------------------------------------------------------
      // 1. RISK ANALYSIS RENDERER
      // ---------------------------------------------------------
      if (result.type === 'risk') {
        let riskReport: RiskReport;
        try {
           riskReport = JSON.parse(result.content);
        } catch (e) {
           return <div className="prose prose-sm"><ReactMarkdown>{result.content}</ReactMarkdown></div>;
        }

        const getColorClasses = (code: string) => {
          switch(code) {
            case 'red': return { bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-800', icon: 'text-red-600' };
            case 'orange': return { bg: 'bg-orange-50', border: 'border-orange-100', text: 'text-orange-800', icon: 'text-orange-600' };
            case 'yellow': return { bg: 'bg-yellow-50', border: 'border-yellow-100', text: 'text-yellow-800', icon: 'text-yellow-600' };
            default: return { bg: 'bg-green-50', border: 'border-green-100', text: 'text-green-800', icon: 'text-green-600' };
          }
        };
        const theme = getColorClasses(riskReport.overallRisk.colorCode);

        return (
          <div className="space-y-6">
            {/* Overall Risk Banner */}
            <div className={`${theme.bg} ${theme.border} border rounded-xl p-5 flex flex-col items-center text-center shadow-sm`}>
               <ShieldCheck size={32} className={`${theme.icon} mb-2`} />
               <h3 className={`text-xl font-bold ${theme.text} mb-1`}>{riskReport.overallRisk.level} Risk</h3>
               <p className={`text-sm ${theme.text} opacity-90`}>{riskReport.overallRisk.description}</p>
            </div>

            {/* 1. What Needs Attention */}
            <div>
              <h4 className="flex items-center gap-2 font-bold text-gray-800 text-lg mb-3">
                <Flame className="text-orange-500" size={20} /> What Needs Attention
              </h4>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                 <div className="grid grid-cols-2 bg-gray-50 p-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <div>Issue</div>
                    <div>What It Means</div>
                 </div>
                 <div className="divide-y divide-gray-100">
                    {riskReport.attentionItems.map((item, i) => (
                       <div key={i} className="grid grid-cols-2 p-3 text-sm items-start">
                          <div className="font-semibold text-gray-800 pr-2">{item.issue}</div>
                          <div className="text-gray-600">{item.meaning}</div>
                       </div>
                    ))}
                 </div>
              </div>
            </div>

            {/* 2. Risks to Watch Out For */}
            <div>
               <h4 className="flex items-center gap-2 font-bold text-gray-800 text-lg mb-3">
                  <Activity className="text-blue-500" size={20} /> Risks to Watch Out For
               </h4>
               <div className="grid gap-3">
                  {riskReport.futureRisks.map((risk, i) => (
                     <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <p className="font-bold text-gray-800 mb-1">{risk.risk}</p>
                        <p className="text-sm text-gray-600">{risk.description}</p>
                     </div>
                  ))}
               </div>
            </div>

            {/* 3. Simple Actions */}
            <div className="bg-green-50 rounded-xl p-5 border border-green-100">
               <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                 <Lightbulb size={20} /> What You Should Do
               </h4>
               <ul className="space-y-2">
                 {riskReport.simpleActions.map((action, i) => (
                   <li key={i} className="flex items-start gap-2 text-green-800 text-sm font-medium">
                      <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                      {action}
                   </li>
                 ))}
               </ul>
            </div>

            {/* 4. Urgent Warnings */}
            <div className="bg-red-50 rounded-xl p-5 border border-red-100">
               <h4 className="font-bold text-red-900 mb-3 flex items-center gap-2">
                 <AlertTriangle size={20} /> When to See a Doctor Immediately
               </h4>
               <ul className="space-y-2">
                 {riskReport.urgentWarnings.map((warn, i) => (
                   <li key={i} className="flex items-start gap-2 text-red-800 text-sm font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></div>
                      {warn}
                   </li>
                 ))}
               </ul>
            </div>
          </div>
        );
      }

      // ---------------------------------------------------------
      // 2. SUMMARY RENDERER (Default)
      // ---------------------------------------------------------
      else if (result.type === 'summary') {
        let report: SimplifiedReport;
        try {
          report = JSON.parse(result.content);
        } catch (e) {
           return <div className="prose prose-sm"><ReactMarkdown>{result.content}</ReactMarkdown></div>;
        }

        return (
          <div className="space-y-6">
             {/* Patient Context */}
             {(report.patientInfo?.age || report.patientInfo?.duration) && (
               <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg text-sm text-gray-600">
                  {report.patientInfo.age && (
                    <div className="flex items-center gap-1.5"><User size={16} /> <span className="font-medium">{report.patientInfo.age}</span></div>
                  )}
                  {report.patientInfo.duration && (
                     <div className="flex items-center gap-1.5"><Clock size={16} /> <span>Issue duration: {report.patientInfo.duration}</span></div>
                  )}
               </div>
             )}

             {/* Hero Card */}
             <div className="bg-white rounded-xl shadow-sm border-l-4 border-medical-blue p-5 border-t border-r border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                   <Activity className="text-medical-blue" />
                   What's Happening Right Now
                </h3>
                <div className="bg-blue-50/50 p-3 rounded-lg mb-3">
                  <p className="font-medium text-blue-900">{report.simpleSummary.headline}</p>
                </div>
                <ul className="space-y-2">
                  {report.simpleSummary.keyPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-700">
                      <CheckCircle2 className="w-5 h-5 text-health-green shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
             </div>

             {/* Findings Table */}
             <div>
                <h3 className="font-bold text-gray-800 mb-3 text-lg">🔍 Important Findings</h3>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="grid grid-cols-12 bg-gray-50 p-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                     <div className="col-span-4">Test/Symptom</div>
                     <div className="col-span-3">Result</div>
                     <div className="col-span-5">Meaning</div>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {report.findings.map((item, i) => (
                      <div key={i} className="grid grid-cols-12 p-3 text-sm items-center hover:bg-gray-50 transition-colors">
                         <div className="col-span-4 font-medium text-gray-800">{item.test}</div>
                         <div className="col-span-3 flex items-center">
                            {item.status === 'warning' ? (
                               <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-bold inline-block">{item.result}</span>
                            ) : item.status === 'attention' ? (
                               <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-xs font-bold inline-block">{item.result}</span>
                            ) : (
                               <span className="text-gray-600 font-medium">{item.result}</span>
                            )}
                         </div>
                         <div className="col-span-5 text-gray-500 text-xs leading-tight">{item.meaning}</div>
                      </div>
                    ))}
                  </div>
                </div>
             </div>

             {/* Risk & Actions Grid */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-xl p-5 border border-green-100">
                   <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                     <CheckCircle2 size={18} /> What To Do
                   </h4>
                   <ul className="space-y-2">
                     {report.actionableAdvice.steps.map((step, i) => (
                       <li key={i} className="text-sm text-green-900 flex items-start gap-2">
                         <span className="mt-1.5 w-1.5 h-1.5 bg-green-500 rounded-full shrink-0"></span>
                         {step}
                       </li>
                     ))}
                   </ul>
                </div>
                <div className="bg-orange-50 rounded-xl p-5 border border-orange-100">
                   <h4 className="font-bold text-orange-800 mb-3 flex items-center gap-2">
                     <AlertTriangle size={18} /> Watch For
                   </h4>
                   <ul className="space-y-2">
                     {report.actionableAdvice.warningSigns.map((sign, i) => (
                       <li key={i} className="text-sm text-orange-900 flex items-start gap-2">
                         <span className="mt-1.5 w-1.5 h-1.5 bg-orange-500 rounded-full shrink-0"></span>
                         {sign}
                       </li>
                     ))}
                   </ul>
                </div>
             </div>
          </div>
        );
      }

      // ---------------------------------------------------------
      // 3. GENERIC TEXT RENDERER (Insights, Recommendations, etc)
      // ---------------------------------------------------------
      else {
        let HeaderIcon = BookOpen;
        let headerColor = "text-medical-blue";
        if (result.type === 'warning_signs') { HeaderIcon = AlertTriangle; headerColor = "text-red-500"; }
        if (result.type === 'recommendations') { HeaderIcon = CheckCircle2; headerColor = "text-green-600"; }
        if (result.type === 'nutrition') { HeaderIcon = Utensils; headerColor = "text-orange-500"; }
        if (result.type === 'insights') { HeaderIcon = Lightbulb; headerColor = "text-purple-500"; }
        
        return (
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
             <div className="flex items-center gap-2 mb-4 border-b pb-3">
                <HeaderIcon className={`w-5 h-5 ${headerColor}`} />
                <h3 className="font-bold text-gray-800 text-lg capitalize">{result.type.replace('_', ' ')}</h3>
             </div>
             <div className="prose prose-sm prose-blue max-w-none text-gray-700">
                <ReactMarkdown>{result.content}</ReactMarkdown>
             </div>
          </div>
        );
      }
    } catch (e) {
      console.error(e);
      return (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">
          Failed to parse result data.
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white sm:bg-gray-50 flex flex-col sm:p-6 overflow-hidden">
      <div className="bg-white p-4 border-b shadow-sm sm:rounded-t-xl sm:max-w-3xl sm:mx-auto sm:w-full flex items-center justify-between sticky top-0 z-10">
        <h2 className="text-lg font-bold text-gray-800">Analysis Results</h2>
        <div className="flex items-center gap-2">
           <button className="p-2 text-gray-500 hover:text-medical-blue hover:bg-blue-50 rounded-full">
             <Share2 size={20} />
           </button>
           <button 
             onClick={onClose}
             className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
           >
             Close
           </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 sm:max-w-3xl sm:mx-auto sm:w-full sm:bg-transparent pb-24">
        {renderContent()}
        
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-100 rounded-lg flex items-start gap-3">
           <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
           <div className="text-xs text-yellow-800">
             <strong>Disclaimer:</strong> This tool provides general information, not medical advice. Consult a certified healthcare professional for diagnosis or treatment.
           </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsView;
