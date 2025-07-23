// src/app/data/predictions.js

import mongoose from 'mongoose';

const PredictionSchema = new mongoose.Schema({
  sport: {
    type: String,
    required: [true, 'Le sport est requis.'],
    enum: ['football', 'basketball', 'tennis', 'Tous'],
  },
  matchDate: {
    type: Date,
    required: [true, 'La date du match est requise.'],
  },
  teams: {
    type: String,
    required: [true, 'Les équipes sont requises.'],
  },
  prediction: {
    type: String,
    required: [true, 'Le pronostic est requis.'],
  },
  odds: {
    type: Number,
    required: [true, 'La cote est requise.'],
  },
  stake: {
    type: Number,
    required: [true, 'La mise est requise.'],
  },
  status: { // Statut actuel (À venir, Terminé)
    type: String,
    enum: ['À venir', 'Terminé'],
    default: 'À venir',
  },
  // NOUVEAUX CHAMPS pour le résultat réel et l'issue du pronostic
  actualResult: { // Par exemple: "2-1", "Victoire équipe A", "Annulé"
    type: String,
    required: false,
    default: null,
  },
  outcome: { // Résultat du pronostic: "Gagnant", "Perdant", "Nul"
    type: String,
    enum: ['Gagnant', 'Perdant', 'Nul', null], // Null pour les pronostics "À venir"
    default: null,
    required: false,
  },
}, {
  timestamps: true, // Ajoute automatiquement createdAt et updatedAt
});

// Empêche la redéfinition du modèle si déjà défini (utile pour Next.js en développement)
export default mongoose.models.Prediction || mongoose.model('Prediction', PredictionSchema);