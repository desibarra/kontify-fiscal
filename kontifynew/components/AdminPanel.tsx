import React, { useState } from 'react';
import DashboardView from './DashboardView';
import LeadsView from './LeadsView';
import AsesoresView from './ExpertsView';
import ReportsView from './ReportsView';
import AuditLogView from './AuditLogView';
import { DashboardIcon } from './icons/DashboardIcon';
import { LeadIcon } from './icons/LeadIcon';
import { UserIcon } from './icons/UserIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { ReportIcon } from './icons/ReportIcon';
import { AuditLogIcon } from './icons/AuditLogIcon';
import type { Asesor } from '../types';
import MyLeadsView from './MyLeadsView';

type AdminView = 'dashboard' | 'leads' | 'asesores' | 'reports' | 'audit';
type AsesorView = 'dashboard' | 'myleads';
type View = AdminView | AsesorView;

interface AdminPanelProps {
  onLogout: () => void;
  currentUser: Asesor;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout, currentUser }) => {
  const initialView: View = currentUser.role === 'admin' ? 'dashboard' : 'myleads';
  const [currentView, setCurrentView] = useState<View>(initialView);
  
  const NavLink: React.FC<{
      view: View; 
      label: string; 
      Icon: React.FC<{className: string;}>
    }> = ({ view, label, Icon }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
        currentView === view
          ? 'bg-indigo-600 text-white'
          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
      }`}
    >
      <Icon className="w-5 h-5 mr-3" />
      <span>{label}</span>
    </button>
  );

  const renderAdminNav = () => (
    <>
      <NavLink view="dashboard" label="Dashboard" Icon={DashboardIcon} />
      <NavLink view="leads" label="Consultas" Icon={LeadIcon} />
      <NavLink view="asesores" label="Asesores" Icon={UserIcon} />
      <NavLink view="reports" label="Reportes" Icon={ReportIcon} />
      <NavLink view="audit" label="Bitácora" Icon={AuditLogIcon} />
    </>
  );

  const renderAsesorNav = () => (
      <NavLink view="myleads" label="Mis Consultas" Icon={LeadIcon} />
  );

  const renderView = () => {
    // Security check: ensure asesor cannot access admin views
    if (currentUser.role === 'asesor' && !['dashboard', 'myleads'].includes(currentView)) {
        setCurrentView('myleads'); // Default to safe view
        return <MyLeadsView currentUser={currentUser} />;
    }

    switch (currentView) {
      // Common Views
      case 'dashboard':
        return <DashboardView currentUser={currentUser} />;

      // Admin Views
      case 'leads':
        return <LeadsView currentUser={currentUser} />;
      case 'asesores':
        return <AsesoresView currentUser={currentUser} />;
      case 'reports':
        return <ReportsView currentUser={currentUser} />;
      case 'audit':
        return <AuditLogView currentUser={currentUser} />;

      // Asesor Views
      case 'myleads':
        return <MyLeadsView currentUser={currentUser} />;

      default:
        return currentUser.role === 'admin' 
            ? <DashboardView currentUser={currentUser}/>
            : <MyLeadsView currentUser={currentUser}/>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-gray-800 text-white flex flex-col p-4">
        <div className="flex items-center gap-2 px-2 mb-8">
            <SparklesIcon className="w-8 h-8 text-indigo-400" />
            <span className="text-xl font-bold">Kontify Fiscal</span>
        </div>
        <div className="px-2 mb-4">
            <p className="text-sm text-gray-400">{currentUser.name}</p>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400">{currentUser.role}</p>
        </div>
        <nav className="flex-1 space-y-2">
          {currentUser.role === 'admin' ? renderAdminNav() : renderAsesorNav()}
        </nav>
        <div className="mt-auto">
          <button
            onClick={onLogout}
            className="flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-lg text-gray-300 hover:bg-red-500 hover:text-white transition-colors"
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
        {renderView()}
      </main>
    </div>
  );
};

export default AdminPanel;