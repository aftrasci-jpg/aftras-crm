import React from 'react';
import { useAppLogo } from '../hooks/useAppLogo';

interface AppLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showFallback?: boolean;
  alt?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({ 
  className = '', 
  size = 'md',
  showFallback = true,
  alt = 'Logo'
}) => {
  const { logo, loading, error } = useAppLogo();

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  const fallbackLogo = (
    <div className={`bg-orange-500 rounded-lg flex items-center justify-center text-white font-black text-lg shadow-lg shadow-orange-500/20 ${sizeClasses[size]} ${className}`}>
      A
    </div>
  );

  if (loading) {
    return (
      <div className={`bg-gray-200 rounded-lg animate-pulse ${sizeClasses[size]} ${className}`}>
        <div className="w-full h-full bg-gray-300 rounded-lg"></div>
      </div>
    );
  }

  if (error && showFallback) {
    return fallbackLogo;
  }

  if (!logo && showFallback) {
    return fallbackLogo;
  }

  if (!logo) {
    return null;
  }

  return (
    <img 
      src={logo} 
      alt={alt}
      className={`rounded-lg object-contain shadow-lg ${sizeClasses[size]} ${className}`}
      onError={(e) => {
        // Si l'image est corrompue, afficher le fallback
        if (showFallback) {
          e.currentTarget.style.display = 'none';
        }
      }}
    />
  );
};