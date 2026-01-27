import { useState, useEffect, useCallback } from 'react';
import { dataService } from '../services/dataService';

export const useAppLogo = () => {
  const [logo, setLogo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLogo = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const logoData = await dataService.getAppLogo();
      setLogo(logoData);
    } catch (err) {
      console.error('Erreur chargement logo:', err);
      setError('Erreur lors du chargement du logo');
      setLogo(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateLogo = useCallback(async (logoData: string) => {
    try {
      setLoading(true);
      setError(null);
      await dataService.updateAppLogo(logoData);
      setLogo(logoData);
      return true;
    } catch (err) {
      console.error('Erreur mise à jour logo:', err);
      setError('Erreur lors de la mise à jour du logo');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLogo();
    
    const handleLogoChange = () => {
      loadLogo();
    };

    window.addEventListener('app-logo-changed', handleLogoChange);
    
    return () => {
      window.removeEventListener('app-logo-changed', handleLogoChange);
    };
  }, [loadLogo]);

  return {
    logo,
    loading,
    error,
    updateLogo,
    refreshLogo: loadLogo
  };
};