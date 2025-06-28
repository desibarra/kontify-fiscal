
import React, { useState } from 'react';
import Chatbot from './Chatbot';
import { UserIcon } from './icons/UserIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface PublicPageProps {
  onAdminClick: () => void;
}

// Array de títulos dinámicos para rotar
const rotatingTitles = [
  "Asesoría Fiscal Inteligente para tu Negocio",
  "Impuestos en Orden, Negocio en Crecimiento",
  "El Aliado Experto para tus Obligaciones Fiscales",
  "Conecta con el Experto Fiscal Perfecto, al Instante",
  "El Futuro de la Asesoría Fiscal está Aquí"
];

// Función para seleccionar un título aleatorio, usada como inicializador de estado
const selectRandomTitle = () => {
    const randomIndex = Math.floor(Math.random() * rotatingTitles.length);
    return rotatingTitles[randomIndex];
};

const PublicPage: React.FC<PublicPageProps> = ({ onAdminClick }) => {
  // Usar useState con una función inicializadora para seleccionar el título solo una vez
  const [dynamicTitle] = useState(selectRandomTitle);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-4 font-sans">
      <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <SparklesIcon className="w-8 h-8 text-indigo-500" />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Kontify Fiscal</h1>
        </div>
        <button 
          onClick={onAdminClick}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <UserIcon className="w-4 h-4" />
          Acceso Asesores
        </button>
      </header>
      
      <main className="flex flex-col items-center text-center w-full max-w-2xl mt-20 md:mt-0">
        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
          {dynamicTitle}
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-xl">
          Nuestro asistente fiscal inteligente analiza tu situación y te conecta con el asesor experto que tu negocio necesita. Inicia una conversación y pon tus impuestos en orden.
        </p>
        <Chatbot />
      </main>

      <footer className="absolute bottom-4 text-sm text-gray-500 dark:text-gray-400">
        © {new Date().getFullYear()} Kontify Fiscal. Todos los derechos reservados.
      </footer>
    </div>
  );
};

export default PublicPage;