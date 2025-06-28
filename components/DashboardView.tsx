import React, { useState, useEffect } from 'react';
import type { Lead, Asesor, LeadStatus } from '../types';
import { apiGetDashboardStats, apiGetLeads } from '../services/apiService';
import { DashboardIcon, LeadIcon, UserIcon } from './icons/DashboardIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface DashboardViewProps {
  currentUser: Asesor;
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md flex items-center justify-between">
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-full">
            {icon}
        </div>
    </div>
);

const translateStatus = (status: LeadStatus) => {
    switch (status) {
        case 'pending': return 'Pendiente';
        case 'assigned': return 'Asignada';
        case 'rejected': return 'Rechazada';
        case 'completed': return 'Completada';
        default: return status;
    }
};

const DashboardView: React.FC<DashboardViewProps> = ({ currentUser }) => {
    const [stats, setStats] = useState({ totalLeads: 0, pendingLeads: 0, assignedLeads: 0, completedLeads: 0, activeExperts: 0 });
    const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const [statsData, leadsData] = await Promise.all([
                apiGetDashboardStats(),
                apiGetLeads()
            ]);
            setStats(statsData);
            setRecentLeads(leadsData.slice(0, 5));
            setIsLoading(false);
        };
        fetchData();
    }, [currentUser]);

    const getStatusChip = (status: LeadStatus) => {
        const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
        switch (status) {
            case 'pending': return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300`;
            case 'assigned': return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300`;
            case 'completed': return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300`;
            case 'rejected': return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300`;
        }
    };

    if (isLoading) {
        return <div className="flex items-center justify-center h-full"><SpinnerIcon className="w-8 h-8 text-indigo-500" /></div>;
    }
    
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        {currentUser.role === 'admin' ? 'Dashboard Global' : 'Mis Consultas Asignadas'}
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Consultas Totales" value={stats.totalLeads} icon={<LeadIcon className="w-6 h-6 text-indigo-500" />} />
        {currentUser.role === 'admin' && <StatCard title="Pendientes de Asignación" value={stats.pendingLeads} icon={<DashboardIcon className="w-6 h-6 text-yellow-500" />} />}
        <StatCard title="Consultas Activas" value={stats.assignedLeads} icon={<DashboardIcon className="w-6 h-6 text-blue-500" />} />
        <StatCard title="Consultas Completadas" value={stats.completedLeads} icon={<DashboardIcon className="w-6 h-6 text-green-500" />} />
        {currentUser.role === 'admin' && <StatCard title="Asesores Activos" value={stats.activeExperts} icon={<UserIcon className="w-6 h-6 text-purple-500" />} />}
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Consultas Recientes</h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                    <th scope="col" className="px-6 py-3">Cliente</th>
                    <th scope="col" className="px-6 py-3 hidden md:table-cell">Resumen de Consulta</th>
                    <th scope="col" className="px-6 py-3">Estado</th>
                    <th scope="col" className="px-6 py-3">Fecha</th>
                </tr>
                </thead>
                <tbody>
                {recentLeads.map(lead => (
                    <tr key={lead.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{lead.name}</td>
                    <td className="px-6 py-4 truncate max-w-sm hidden md:table-cell">{lead.query_details}</td>
                    <td className="px-6 py-4"><span className={getStatusChip(lead.status)}>{translateStatus(lead.status)}</span></td>
                    <td className="px-6 py-4">{new Date(lead.created_at).toLocaleDateString()}</td>
                    </tr>
                ))}
                </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;