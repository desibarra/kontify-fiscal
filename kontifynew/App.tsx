import React, { useState, useEffect } from 'react';
import PublicPage from './components/PublicPage';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import type { Asesor } from './types';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Asesor | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Verify token with backend in a real app. Here we trust localStorage.
    const savedUser = localStorage.getItem('kontify_user');
    const savedToken = localStorage.getItem('kontify_token');

    if (savedUser && savedToken) {
      try {
        const user: Asesor = JSON.parse(savedUser);
        setCurrentUser(user);
      } catch(e) {
        // Clear corrupt data
        localStorage.removeItem('kontify_user');
        localStorage.removeItem('kontify_token');
      }
    }
    setIsLoading(false);
  }, []);

  const handleLoginSuccess = (user: Asesor, token: string) => {
    localStorage.setItem('kontify_user', JSON.stringify(user));
    localStorage.setItem('kontify_token', token);
    setCurrentUser(user);
    setShowAdmin(false); // Go to panel after login
  };

  const handleLogout = () => {
    // In a real app, you might want to call a backend logout endpoint to invalidate the token.
    localStorage.removeItem('kontify_user');
    localStorage.removeItem('kontify_token');
    setCurrentUser(null);
  };
  
  // This state now controls whether to show the login screen or the public page
  const [showAdmin, setShowAdmin] = useState(false);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900 text-white"><p>Cargando...</p></div>;
  }

  // If a user is authenticated, show the admin panel
  if (currentUser) {
    return <AdminPanel currentUser={currentUser} onLogout={handleLogout} />;
  }
  
  // If not authenticated, decide between public page and login screen
  if (showAdmin) {
    return <Login onLoginSuccess={handleLoginSuccess} onBack={() => setShowAdmin(false)} />;
  }
  
  return <PublicPage onAdminClick={() => setShowAdmin(true)} />;
};

export default App;