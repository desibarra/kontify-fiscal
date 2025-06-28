import React, { useState, useEffect } from 'react';
import type { Lead, Asesor, LeadStatus } from '../types';
import LeadDetailModal from './LeadDetailModal';
import { apiGetLeads, apiGetAsesores, apiUpdateLead } from '../services/apiService';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface LeadsViewProps {
  currentUser: Asesor;
}

const translateStatus = (status: LeadStatus) => {
    switch (status) {
        case 'pending': return 'Pendiente';
        case 'assigned': return 'Asignada';
        case 'rejected': return 'Rechazada';
        case 'completed': return 'Completada';
        default: return status;
    }
};

const LeadsView: React.FC<LeadsViewProps> = ({ currentUser }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [asesores, setAsesores] = useState<Asesor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        const [leadsData, asesoresData] = await Promise.all([
            apiGetLeads(),
            apiGetAsesores()
        ]);
        setLeads(leadsData);
        setAsesores(asesoresData);
        setIsLoading(false);
    };
    fetchData();
  }, [currentUser]);

  const handleUpdateLead = async (updatedLead: Lead) => {
      const result = await apiUpdateLead(updatedLead);
      if (result) {
          setLeads(leads.map(lead => lead.id === result.id ? result : lead));
      }
      setSelectedLead(null);
  };

  const getStatusChip = (status: LeadStatus) => {
    const baseClasses = 'px-2.5 py-1 text-xs font-semibold rounded-full inline-block';
    switch (status) {
      case 'pending': return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300`;
      case 'assigned': return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300`;
      case 'completed': return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300`;
      case 'rejected': return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300`;
      default: return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200`;
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><SpinnerIcon className="w-8 h-8 text-indigo-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestionar Todas las Consultas</h1>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                <th scope="col" className="px-6 py-3">Cliente</th>
                <th scope="col" className="px-6 py-3 hidden sm:table-cell">Email</th>
                <th scope="col" className="px-6 py-3">Estado</th>
                <th scope="col" className="px-6 py-3">Asesor Asignado</th>
                <th scope="col" className="px-6 py-3 hidden md:table-cell">Recibido</th>
                <th scope="col" className="px-6 py-3"><span className="sr-only">Acciones</span></th>
                </tr>
            </thead>
            <tbody>
                {leads.map(lead => {
                const assignedAsesor = asesores.find(e => e.id === lead.asesor_id);
                return (
                    <tr key={lead.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{lead.name}</td>
                    <td className="px-6 py-4 hidden sm:table-cell">{lead.email}</td>
                    <td className="px-6 py-4">
                        <span className={getStatusChip(lead.status)}>
                        {translateStatus(lead.status)}
                        </span>
                    </td>
                    <td className="px-6 py-4">{assignedAsesor ? assignedAsesor.name : <span className="text-gray-400 italic">Sin asignar</span>}</td>
                    <td className="px-6 py-4 hidden md:table-cell">{new Date(lead.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                        <button onClick={() => setSelectedLead(lead)} className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                        Revisar
                        </button>
                    </td>
                    </tr>
                );
                })}
            </tbody>
            </table>
        </div>
      </div>
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          asesores={asesores}
          currentUser={currentUser}
          onClose={() => setSelectedLead(null)}
          onUpdate={handleUpdateLead}
        />
      )}
    </div>
  );
};

export default LeadsView;