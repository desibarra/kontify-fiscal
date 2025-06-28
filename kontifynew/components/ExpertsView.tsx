import React, { useState, useEffect } from 'react';
import type { Asesor } from '../types';
import { apiGetAsesores, apiUpdateAsesorStatus } from '../services/apiService';
import { SpinnerIcon } from './icons/SpinnerIcon';
import Toast from './Toast';

interface AsesoresViewProps {
  currentUser: Asesor;
}

const AsesoresView: React.FC<AsesoresViewProps> = ({ currentUser }) => {
  const [asesores, setAsesores] = useState<Asesor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const data = await apiGetAsesores();
      setAsesores(data);
      setIsLoading(false);
    };
    fetchData();
  }, [currentUser]);

  const handleStatusChange = async (asesorId: number, newStatus: 'active' | 'inactive') => {
      const success = await apiUpdateAsesorStatus(asesorId, newStatus);
      if (success) {
          setAsesores(asesores.map(a => a.id === asesorId ? { ...a, status: newStatus } : a));
          setToastMessage("Estado del asesor actualizado con éxito.");
      } else {
          setToastMessage("Error al actualizar el estado.");
      }
  };

  const handleResetPassword = (asesorName: string) => {
      // In a real app, this would trigger a secure flow.
      alert(`Una acción de reseteo de contraseña sería enviada para ${asesorName}.`);
  };

  const getStatusChip = (status: 'active' | 'inactive') => {
    const baseClasses = 'px-2.5 py-1 text-xs font-semibold rounded-full inline-block';
    if (status === 'active') {
      return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300`;
    }
    return `${baseClasses} bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300`;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><SpinnerIcon className="w-8 h-8 text-indigo-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestionar Asesores Fiscales</h1>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                <th scope="col" className="px-6 py-3">Nombre</th>
                <th scope="col" className="px-6 py-3 hidden sm:table-cell">Email</th>
                <th scope="col" className="px-6 py-3">Especialidad</th>
                <th scope="col" className="px-6 py-3">Estado</th>
                <th scope="col" className="px-6 py-3">Facturación</th>
                <th scope="col" className="px-6 py-3">Acciones</th>
                </tr>
            </thead>
            <tbody>
                {asesores.map(asesor => (
                <tr key={asesor.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{asesor.name}</td>
                    <td className="px-6 py-4 hidden sm:table-cell">{asesor.email}</td>
                    <td className="px-6 py-4">{asesor.specialization}</td>
                    <td className="px-6 py-4">
                        <span className={getStatusChip(asesor.status)}>{asesor.status === 'active' ? 'Activo' : 'Inactivo'}</span>
                    </td>
                    <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            asesor.billing_status === 'active' ? 'bg-green-100 text-green-800' :
                            asesor.billing_status === 'pending_payment' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                        }`}>
                            {asesor.billing_status.replace('_', ' ')}
                        </span>
                    </td>
                    <td className="px-6 py-4 space-x-2 whitespace-nowrap">
                        {asesor.id !== currentUser.id && (
                            <>
                            <button onClick={() => handleStatusChange(asesor.id, asesor.status === 'active' ? 'inactive' : 'active')} className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                                {asesor.status === 'active' ? 'Desactivar' : 'Activar'}
                            </button>
                            <button onClick={() => handleResetPassword(asesor.name)} className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                                Reset Pass
                            </button>
                            </>
                        )}
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      </div>
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
    </div>
  );
};

export default AsesoresView;