
import React, { useState, useEffect } from 'react';

interface LogoProps {
  className?: string;
}

/**
 * Composant Logo ultra-résilient.
 * Teste plusieurs variantes de chemins pour trouver le fichier 'logo.png'.
 * Affiche un SVG professionnel en dernier recours.
 */
const Logo: React.FC<LogoProps> = ({ className = "w-10 h-10" }) => {
  const [currentPathIndex, setCurrentPathIndex] = useState(0);
  const [hasFailedAll, setHasFailedAll] = useState(false);

  // Liste des chemins probables par ordre de priorité
  const paths = [
    "/assets/logo.png", 
    "assets/logo.png", 
    "/logo.png", 
    "logo.png"
  ];

  const handleImageError = () => {
    if (currentPathIndex < paths.length - 1) {
      // On tente le chemin suivant
      setCurrentPathIndex(prev => prev + 1);
    } else {
      // Tous les chemins ont échoué, on passe au SVG
      setHasFailedAll(true);
    }
  };

  // Identité visuelle de secours (SVG haute qualité)
  const BrandSVG = (
    <div className={`relative flex items-center justify-center bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl shadow-lg ${className} border border-white/20 group-hover:rotate-3 transition-all duration-500`}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-2/3 h-2/3 text-white">
        <path d="M50 15L85 75H15L50 15Z" fill="currentColor" fillOpacity="0.2" />
        <path d="M50 25L75 70H25L50 25Z" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M40 55L50 45L60 55" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="50" cy="80" r="5" fill="currentColor" />
      </svg>
    </div>
  );

  if (hasFailedAll) {
    return BrandSVG;
  }

  return (
    <div className="inline-block group cursor-pointer">
      <img 
        src={paths[currentPathIndex]} 
        alt="Aftras CRM" 
        className={`${className} object-contain hover:scale-105 transition-transform duration-300`}
        onError={handleImageError}
        onLoad={() => {
          // Si l'image charge, on s'assure que l'état d'échec est faux
          setHasFailedAll(false);
        }}
      />
    </div>
  );
};

export default Logo;
