import React, { useState, useEffect, useMemo } from 'react';
import { LeadStatus } from '../types';
import type { Asesor, Lead } from '../types';
import { apiGetLeads, apiGetAsesores } from '../services/apiService';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface ReportsViewProps {
    currentUser: Asesor;
}

// Utility to download CSV
const downloadCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
        alert("No hay datos para exportar con los filtros seleccionados.");
        return;
    }
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => {
            let field = row[header] === null ? '' : row[header];
            // Escape quotes and commas
            field = String(field).replace(/"/g, '""');
            if (String(field).includes(',')) {
                field = `"${field}"`;
            }
            return field;
        }).join(','))
    ].join('\n');
    
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' }); // Add BOM for Excel
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};


const ReportsView: React.FC<ReportsViewProps> = ({ currentUser }) => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [asesores, setAsesores] = useState<Asesor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Filters
    const [filters, setFilters] = useState({
        asesorId: 'all',
        status: 'all',
        source: 'all',
        startDate: '',
        endDate: '',
    });

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

    const filteredLeads = useMemo(() => {
        return leads.filter(lead => {
            const leadDate = new Date(lead.created_at);
            const startDate = filters.startDate ? new Date(filters.startDate) : null;
            const endDate = filters.endDate ? new Date(filters.endDate) : null;

            if (startDate && leadDate < startDate) return false;
            if (endDate) {
                // Set end date to the end of the day
                const endOfDay = new Date(endDate);
                endOfDay.setHours(23, 59, 59, 999);
                if(leadDate > endOfDay) return false;
            }
            if (filters.status !== 'all' && lead.status !== filters.status) return false;
            if (filters.source !== 'all' && lead.source !== filters.source) return false;
            if (filters.asesorId !== 'all' && String(lead.asesor_id) !== filters.asesorId) return false;
            
            return true;
        });
    }, [leads, filters]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleExport = () => {
        const dataToExport = filteredLeads.map(lead => ({
            ID_Consulta: lead.id,
            Cliente: lead.name,
            Email: lead.email,
            Fecha_Creacion: new Date(lead.created_at).toLocaleString('es-MX'),
            Estado: lead.status,
            Origen: lead.source,
            Asesor_Asignado: asesores.find(a => a.id === lead.asesor_id)?.name || 'N/A',
            Consulta: lead.query_details,
        }));
        downloadCSV(dataToExport, `reporte_consultas_${new Date().toISOString().split('T')[0]}.csv`);
    };

    if (isLoading) {
        return <div className="flex items-center justify-center h-full"><SpinnerIcon className="w-8 h-8 text-indigo-500" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reportes y Métricas</h1>
                <button onClick={handleExport} className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700">
                    Exportar a CSV
                </button>
            </div>
            
            {/* Filters Card */}
            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                        <option value="all">Todos los Estados</option>
                        {Object.values(LeadStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select name="asesorId" value={filters.asesorId} onChange={handleFilterChange} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                        <option value="all">Todos los Asesores</option>
                        {asesores.filter(a => a.role === 'asesor').map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                    <select name="source" value={filters.source} onChange={handleFilterChange} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                        <option value="all">Todos los Orígenes</option>
                        <option value="chatbot">Chatbot</option>
                        <option value="manual">Manual</option>
                    </select>
                    <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                    <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                </div>
            </div>

            {/* Results Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                <p className="p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Resultados: {filteredLeads.length} consultas</p>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th className="px-6 py-3">Cliente</th>
                                <th className="px-6 py-3">Estado</th>
                                <th className="px-6 py-3">Asesor</th>
                                <th className="px-6 py-3">Fecha</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLeads.slice(0, 20).map(lead => (
                                <tr key={lead.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{lead.name}</td>
                                    <td className="px-6 py-4">{lead.status}</td>
                                    <td className="px-6 py-4">{asesores.find(a => a.id === lead.asesor_id)?.name || 'N/A'}</td>
                                    <td className="px-6 py-4">{new Date(lead.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {filteredLeads.length > 20 && <p className="p-4 text-xs text-center text-gray-500">Mostrando 20 de {filteredLeads.length} resultados. Use exportar para ver todos.</p>}
                </div>
            </div>
        </div>
    );
};

export default ReportsView;