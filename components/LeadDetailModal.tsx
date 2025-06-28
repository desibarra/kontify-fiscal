import React, { useState } from 'react';
import type { Lead, Asesor, LeadStatus, AIAnalysis } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import Toast from './Toast';
import { analyzeLeadQuery } from '../services/geminiService';

interface LeadDetailModalProps {
  lead: Lead;
  asesores: Asesor[];
  currentUser: Asesor;
  onClose: () => void;
  onUpdate: (lead: Lead) => void;
}

const LeadDetailModal: React.FC<LeadDetailModalProps> = ({ lead, asesores, currentUser, onClose, onUpdate }) => {
  const [assignedExpertId, setAssignedExpertId] = useState<string>(String(lead.asesor_id || ''));
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const isAdmin = currentUser.role === 'admin';

  const handleRunAnalysis = async () => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    setAiAnalysis(null);
    const analysisResult = await analyzeLeadQuery(lead.query_details);
    setIsAnalyzing(false);

    if (analysisResult) {
      setAiAnalysis(analysisResult);
      
      const suggestedSpecialization = analysisResult.suggested_specialization;
      const availableAsesor = asesores.find(
        a => a.specialization === suggestedSpecialization && a.status === 'active' && a.role === 'asesor'
      );
      if (availableAsesor) {
        setAssignedExpertId(String(availableAsesor.id));
        setToastMessage(`Análisis completado. Se sugiere a ${availableAsesor.name}.`);
      } else {
        setToastMessage("Análisis de IA completado.");
      }
    } else {
      setToastMessage("Error al realizar el análisis de IA.");
    }
  };

  const handleUpdateStatus = (newStatus: LeadStatus) => {
    if(!isAdmin) return;
    setIsSaving(true);
    const updatedLead: Lead = {
      ...lead,
      status: newStatus,
      asesor_id: newStatus === 'assigned' ? Number(assignedExpertId) : newStatus === 'rejected' ? null : lead.asesor_id,
    };
    onUpdate(updatedLead);
    setIsSaving(false);
  };

  const AnalysisResultCard = () => (
    aiAnalysis && (
        <div className="p-4 bg-indigo-50 dark:bg-gray-700/50 rounded-lg space-y-3 border border-indigo-200 dark:border-gray-600">
            <h4 className="font-semibold text-indigo-800 dark:text-indigo-300 flex items-center gap-2"><SparklesIcon className="w-5 h-5" /> Análisis de IA</h4>
            <p><strong>Resumen:</strong> <span className="text-gray-700 dark:text-gray-300">{aiAnalysis.summary}</span></p>
            <div>
                <strong>Prioridad:</strong>
                <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${
                    aiAnalysis.priority === 'High' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' :
                    aiAnalysis.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' :
                    'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                }`}>{aiAnalysis.priority}</span>
            </div>
            <p><strong>Especialización Sugerida:</strong> <span className="text-gray-700 dark:text-gray-300">{aiAnalysis.suggested_specialization}</span></p>
        </div>
    )
  );
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Detalles de la Consulta</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-3xl leading-none">&times;</button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Información del Cliente</h3>
            <p><strong className="text-gray-500 dark:text-gray-400">Nombre:</strong> {lead.name}</p>
            <p><strong className="text-gray-500 dark:text-gray-400">Email:</strong> {lead.email}</p>
            <p><strong className="text-gray-500 dark:text-gray-400">Recibido:</strong> {new Date(lead.created_at).toLocaleString()}</p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Detalles de la Consulta</h3>
            <p className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{lead.query_details}</p>
          </div>
          
          {isAdmin && (
            <div>
                {isAnalyzing ? (
                    <div className="flex items-center justify-center p-4 h-24 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        <SpinnerIcon className="w-6 h-6 text-indigo-500" />
                        <span className="ml-3 text-sm text-gray-600 dark:text-gray-300">Analizando consulta...</span>
                    </div>
                ) : aiAnalysis ? (
                    <AnalysisResultCard />
                ) : (
                    lead.status === 'pending' && (
                        <button 
                            onClick={handleRunAnalysis}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 transition-all shadow-sm hover:shadow-md"
                            disabled={isAnalyzing}
                        >
                            <SparklesIcon className="w-5 h-5"/>
                            Analizar con IA para Asignar
                        </button>
                    )
                )}
            </div>
          )}
          
          {isAdmin && lead.status !== 'rejected' && lead.status !== 'completed' && (
            <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Asignar Asesor</h3>
                <select
                value={assignedExpertId}
                onChange={(e) => setAssignedExpertId(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                >
                <option value="">Selecciona un asesor...</option>
                {asesores.filter(e => e.status === 'active' && e.role === 'asesor').map(expert => (
                    <option key={expert.id} value={expert.id}>{expert.name} ({expert.specialization})</option>
                ))}
                </select>
            </div>
          )}
        </div>
        
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          {isAdmin ? (
            <>
              <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600">Cancelar</button>
              {lead.status === 'pending' && (
                  <>
                      <button onClick={() => handleUpdateStatus('rejected')} disabled={isSaving} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-red-400">Rechazar</button>
                      <button onClick={() => handleUpdateStatus('assigned')} disabled={!assignedExpertId || isSaving} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">Asignar Asesor</button>
                  </>
              )}
              {lead.status === 'assigned' && (
                  <button onClick={() => handleUpdateStatus('completed')} disabled={isSaving} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-green-400">Marcar como Completada</button>
              )}
            </>
          ) : (
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600">Cerrar</button>
          )}
        </div>
      </div>
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
    </div>
  );
};

export default LeadDetailModal;