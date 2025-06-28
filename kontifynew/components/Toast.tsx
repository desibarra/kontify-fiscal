
import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => {
      clearTimeout(timer);
    };
  }, [onClose, duration]);

  return (
    <div className="fixed bottom-5 right-5 bg-gray-900 text-white py-3 px-5 rounded-lg shadow-lg animate-fade-in-up z-50">
      <p>{message}</p>
    </div>
  );
};

export default Toast;