import React, { useState } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { apiLogin } from '../services/apiService';
import type { Asesor } from '../types';

interface LoginProps {
  onLoginSuccess: (user: Asesor, token: string) => void;
  onBack: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await apiLogin(email, password);

    if (result) {
      onLoginSuccess(result.user, result.token);
    } else {
      setError('Email o contraseña inválidos. Por favor, inténtalo de nuevo.');
      setIsLoading(false);
    }
  };

  const handlePasswordRecovery = (e: React.FormEvent) => {
      e.preventDefault();
      // In a real app, this would trigger an email. Here, we just show a message.
      alert(`Si el email ${email} está registrado, recibirá un enlace de recuperación.`);
      setForgotPassword(false);
  }

  if (forgotPassword) {
      return (
         <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">Recuperar Contraseña</h2>
                <form className="space-y-6" onSubmit={handlePasswordRecovery}>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.</p>
                    <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm"
                        placeholder="tu-email@kontify.mx"
                    />
                    <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                        Enviar Enlace
                    </button>
                </form>
                <button onClick={() => setForgotPassword(false)} className="w-full text-center text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                    &larr; Volver a Iniciar Sesión
                </button>
            </div>
        </div>
      );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div className="flex flex-col items-center">
          <SparklesIcon className="w-12 h-12 text-indigo-500 mb-2" />
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">Panel de Asesores</h2>
        </div>
        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">Dirección de email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-gray-100"
              placeholder="admin@kontify.mx"
            />
          </div>
          <div>
            <label htmlFor="password"  className="text-sm font-medium text-gray-700 dark:text-gray-300">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-gray-100"
              placeholder="Contraseña"
            />
          </div>
          <div className="text-right text-sm">
            <button type="button" onClick={() => setForgotPassword(true)} className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
              ¿Olvidaste tu contraseña?
            </button>
          </div>
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              {isLoading ? 'Iniciando...' : 'Iniciar sesión'}
            </button>
          </div>
        </form>
         <button 
            onClick={onBack} 
            className="w-full text-center text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
        >
            &larr; Volver a la Página Principal
        </button>
      </div>
    </div>
  );
};

export default Login;