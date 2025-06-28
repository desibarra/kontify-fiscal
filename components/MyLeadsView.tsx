import React, { useState, useEffect } from 'react';
import type { Lead, Asesor, LeadStatus } from '../types';
import LeadDetailModal from './LeadDetailModal';
import { apiGetLeads } from '../services/apiService';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface MyLeadsViewProps {
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

const MyLeadsView: React.FC<MyLeadsViewProps> = ({ currentUser }) => {
  const [myLeads, setMyLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        // The API service, combined with the backend logic, ensures we only get leads for the current user
        const leadsData = await apiGetLeads();
        setMyLeads(leadsData);
        setIsLoading(false);
    };
    fetchData();
  }, [currentUser]);

  const handleUpdateLead = (updatedLead: Lead) => {
      // Asesores can't update leads directly in this version.
      // The modal's UI will prevent this, but this is a safeguard.
      console.log("Attempt to update lead by asesor (action disabled):", updatedLead);
      setSelectedLead(null);
  };

  const getStatusChip = (status: LeadStatus) => {
    const baseClasses = 'px-2.5 py-1 text-xs font-semibold rounded-full inline-block';
    switch (status) {
      case 'assigned': return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300`;
      case 'completed': return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300`;
      default: return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200`;
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><SpinnerIcon className="w-8 h-8 text-indigo-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mis Consultas Asignadas</h1>
       {myLeads.length === 0 && !isLoading ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <p className="text-gray-500 dark:text-gray-400">No tienes consultas asignadas en este momento.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                    <th scope="col" className="px-6 py-3">Cliente</th>
                    <th scope="col" className="px-6 py-3 hidden sm:table-cell">Email</th>
                    <th scope="col" className="px-6 py-3">Estado</th>
                    <th scope="col" className="px-6 py-3 hidden md:table-cell">Recibido</th>
                    <th scope="col" className="px-6 py-3"><span className="sr-only">Acciones</span></th>
                    </tr>
                </thead>
                <tbody>
                    {myLeads.map(lead => (
                        <tr key={lead.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{lead.name}</td>
                        <td className="px-6 py-4 hidden sm:table-cell">{lead.email}</td>
                        <td className="px-6 py-4">
                            <span className={getStatusChip(lead.status)}>
                            {translateStatus(lead.status)}
                            </span>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">{new Date(lead.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-right">
                            <button onClick={() => setSelectedLead(lead)} className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                            Ver Detalles
                            </button>
                        </td>
                        </tr>
                    ))}
                </tbody>
                </table>
            </div>
        </div>
      )}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          asesores={[]} // Asesor doesn't need the list of other asesores
          currentUser={currentUser}
          onClose={() => setSelectedLead(null)}
          onUpdate={handleUpdateLead}
        />
      )}
    </div>
  );
};

export default MyLeadsView;