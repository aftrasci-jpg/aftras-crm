import React, { useState, useEffect } from 'react';
import { Prospect, ProspectStatus } from '../types';
import { dataService } from '../services/dataService';
import { ICONS } from '../constants';

const AFRICAN_COUNTRIES: Record<string, string> = {
  '+225': "Côte d'Ivoire",
  '+221': "Sénégal",
  '+237': "Cameroun",
  '+212': "Maroc",
  '+213': "Algérie",
  '+216': "Tunisie",
  '+223': "Mali",
  '+226': "Burkina Faso",
  '+227': "Niger",
  '+228': "Togo",
  '+229': "Bénin",
  '+241': "Gabon",
  '+242': "Congo-Brazzaville",
  '+243': "RD Congo",
  '+261': "Madagascar",
  '+234': "Nigéria",
  '+254': "Kenya",
  '+27': "Afrique du Sud"
};

interface PublicProspectFormProps {
  agentId: string;
}

export const PublicProspectForm: React.FC<PublicProspectFormProps> = ({ agentId }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    company: '',
    email: '',
    phone: '',
    countryCode: '+225',
    country: "Côte d'Ivoire",
    city: '',
    product: '',
    details: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleCountryCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const countryCode = e.target.value;
    setFormData(prev => ({
      ...prev,
      countryCode,
      country: AFRICAN_COUNTRIES[countryCode] || "Autre"
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = (): string | null => {
    if (!formData.fullName.trim()) return 'Veuillez saisir votre nom complet';
    if (!formData.email.trim()) return 'Veuillez saisir votre email';
    if (!/\S+@\S+\.\S+/.test(formData.email)) return 'Veuillez saisir un email valide';
    if (!formData.phone.trim()) return 'Veuillez saisir votre numéro de téléphone';
    if (!formData.city.trim()) return 'Veuillez saisir votre ville';
    if (!formData.product.trim()) return 'Veuillez indiquer le produit ou service qui vous intéresse';
    return null;
  };

  // Gestion du scroll pour les champs focus
  const handleFieldFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    // Petit délai pour s'assurer que le champ est focus
    setTimeout(() => {
      const element = e.target;
      const rect = element.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const elementTop = rect.top + scrollTop;
      const offset = 100; // Espace en haut
      
      if (rect.top < 150) { // Si le champ est dans le haut de l'écran
        window.scrollTo({
          top: elementTop - offset,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      // Création du lead distant
      await dataService.addRemoteLead({
        agentId,
        fullName: formData.fullName,
        company: formData.company || '',
        email: formData.email,
        phone: formData.phone,
        countryCode: formData.countryCode,
        country: formData.country,
        city: formData.city,
        source: 'Formulaire Web Public',
        productOfInterest: formData.product,
        details: formData.details,
        createdAt: new Date().toISOString()
      });

      setSubmitStatus('success');
      setFormData({
        fullName: '',
        company: '',
        email: '',
        phone: '',
        countryCode: '+225',
        country: "Côte d'Ivoire",
        city: '',
        product: '',
        details: ''
      });
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error);
      setErrorMessage("Une erreur est survenue lors de l'envoi de votre demande. Veuillez réessayer.");
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50 py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white text-2xl sm:text-3xl font-black mx-auto mb-4 sm:mb-6 shadow-2xl">
            {ICONS.Prospect}
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-3 sm:mb-4">
            Formulaire de Contact
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Remplissez ce formulaire pour exprimer votre intérêt et être contacté par notre équipe commerciale
          </p>
        </div>

        {/* Success Message */}
        {submitStatus === 'success' && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 sm:p-8 mb-8 text-center animate-in slide-in-from-top-8">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <span className="text-xl sm:text-2xl">✅</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-emerald-900 mb-2">Demande envoyée avec succès !</h3>
            <p className="text-sm sm:text-base text-emerald-700 leading-relaxed">
              Merci pour votre intérêt. Notre équipe commerciale vous contactera très prochainement.
            </p>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-8">
          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              {/* Informations personnelles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    onFocus={handleFieldFocus}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm sm:text-base"
                    placeholder="Votre nom et prénom"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Entreprise (optionnel)
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    onFocus={handleFieldFocus}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm sm:text-base"
                    placeholder="Nom de votre entreprise"
                  />
                </div>
              </div>

              {/* Coordonnées */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Pays *
                  </label>
                  <select
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleCountryCodeChange}
                    onFocus={handleFieldFocus}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm sm:text-base"
                  >
                    {Object.entries(AFRICAN_COUNTRIES).map(([code, name]) => (
                      <option key={code} value={code}>{code} - {name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Ville *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    onFocus={handleFieldFocus}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm sm:text-base"
                    placeholder="Votre ville"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    onFocus={handleFieldFocus}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm sm:text-base"
                    placeholder="Votre numéro de téléphone"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wide">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onFocus={handleFieldFocus}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm sm:text-base"
                  placeholder="votre@email.com"
                />
              </div>

              {/* Produit d'intérêt */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wide">
                  Produit ou service d'intérêt *
                </label>
                <input
                  type="text"
                  name="product"
                  value={formData.product}
                  onChange={handleInputChange}
                  onFocus={handleFieldFocus}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm sm:text-base"
                  placeholder="Quel produit ou service vous intéresse ?"
                />
              </div>

              {/* Détails supplémentaires */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wide">
                  Détails et commentaires
                </label>
                <textarea
                  name="details"
                  value={formData.details}
                  onChange={handleInputChange}
                  onFocus={handleFieldFocus}
                  rows={3}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none text-sm sm:text-base"
                  placeholder="Informations complémentaires, besoins spécifiques, etc."
                ></textarea>
              </div>

              {/* Error Message */}
              {submitStatus === 'error' && errorMessage && (
                <div className="bg-rose-50 border border-rose-200 rounded-lg sm:rounded-xl p-3 sm:p-4 animate-in slide-in-from-top-4">
                  <p className="text-rose-700 text-xs sm:text-sm">{errorMessage}</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-indigo-600 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl font-black uppercase tracking-widest hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-sm sm:text-base"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 sm:-ml-1 sm:mr-3 h-4 sm:h-5 w-4 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Envoi en cours...
                    </span>
                  ) : (
                    'Envoyer ma demande'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 sm:px-8 py-4 sm:py-6 border-t border-gray-100">
            <div className="flex items-center justify-center text-xs sm:text-sm text-gray-500">
              <span className="mr-2">🔒</span>
              Vos informations sont confidentielles et ne seront partagées qu'avec l'équipe commerciale
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};