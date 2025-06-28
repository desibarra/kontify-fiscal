import React, { useState, useEffect, useMemo } from 'react';
import type { Asesor, AuditLog } from '../types';
import { apiGetAuditLogs, apiGetAsesores } from '../services/apiService';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface AuditLogViewProps {
  currentUser: Asesor;
}

const AuditLogView: React.FC<AuditLogViewProps> = ({ currentUser }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [asesores, setAsesores] = useState<Asesor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({ userId: 'all', action: 'all' });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const [logData, asesoresData] = await Promise.all([
        apiGetAuditLogs(),
        apiGetAsesores()
      ]);
      setLogs(logData);
      setAsesores(asesoresData);
      setIsLoading(false);
    };
    fetchData();
  }, [currentUser]);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      if (filters.userId !== 'all' && String(log.userId) !== filters.userId) return false;
      if (filters.action !== 'all' && log.action !== filters.action) return false;
      return true;
    });
  }, [logs, filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };
  
  const uniqueActions = [...new Set(logs.map(log => log.action))];

  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><SpinnerIcon className="w-8 h-8 text-indigo-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bitácora de Auditoría</h1>
      
      {/* Filters */}
      <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select name="userId" value={filters.userId} onChange={handleFilterChange} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
            <option value="all">Todos los Usuarios</option>
            {asesores.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <select name="action" value={filters.action} onChange={handleFilterChange} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
            <option value="all">Todas las Acciones</option>
            {uniqueActions.map(action => <option key={action} value={action}>{action}</option>)}
          </select>
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">Fecha y Hora</th>
                <th scope="col" className="px-6 py-3">Usuario</th>
                <th scope="col" className="px-6 py-3">Acción</th>
                <th scope="col" className="px-6 py-3">Detalles</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => (
                <tr key={log.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{log.userName}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogView;