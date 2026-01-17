
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Client } from "../types";

export class AIService {
  // We don't store the instance to ensure we always use the latest config/key as per guidelines

  /**
   * Generates a sales pitch for a specific client using Gemini.
   */
  async generateSalesPitch(client: Client) {
    try {
      const ai = new GoogleGenerativeAI(import.meta.env.VITE_API_KEY || "");
      const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(`En tant qu'expert en vente chez Aftras CRM, génère un pitch de vente percutant et personnalisé pour le client suivant :
        Nom: ${client.name}
        Produit d'intérêt: ${client.product}
        Localisation: ${client.city}, ${client.country}
        Notes de l'agent: ${client.notes || 'Aucune note spécifique'}

        Le ton doit être professionnel, rassurant et axé sur les bénéfices. Réponds en Markdown.`);
      return result.response.text();
    } catch (error) {
      console.warn("Erreur Gemini:", error);
      return "Désolé, je ne peux pas générer de pitch pour le moment.";
    }
  }

  /**
   * Analyzes global performance stats using Gemini.
   */
  async analyzeGlobalPerformance(stats: any) {
    try {
      const ai = new GoogleGenerativeAI(import.meta.env.VITE_API_KEY || "");
      const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(`Analyse les statistiques de performance suivantes pour l'administrateur du CRM Aftras et donne 3 points clés d'amélioration ou de succès :
        CA Total: ${stats.totalCa} FCFA
        Profit: ${stats.totalBenefit} FCFA
        Ventes: ${stats.totalSales}
        Nombre d'agents: ${stats.agentStats.length}
        Top Produit: ${stats.topProducts[0]?.name || 'N/A'}`);
      return result.response.text();
    } catch (error) {
      return "Analyse indisponible.";
    }
  }
}

export const aiService = new AIService();
