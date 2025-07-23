// src/components/PredictionCard.jsx

import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

function PredictionCard({ prediction, onEdit, onDelete, isAdmin }) {
  // Déterminer la classe CSS en fonction de l'issue du pronostic
  let outcomeClass = '';
  let outcomeText = '';

  if (prediction.outcome === 'Gagnant') {
    outcomeClass = 'outcome-winner';
    outcomeText = 'Gagnant';
  } else if (prediction.outcome === 'Perdant') {
    outcomeClass = 'outcome-loser';
    outcomeText = 'Perdant';
  } else if (prediction.outcome === 'Nul') {
    outcomeClass = 'outcome-draw';
    outcomeText = 'Nul / Annulé';
  } else {
    outcomeClass = 'outcome-pending'; // Pour les pronostics "À venir" ou sans issue
    outcomeText = 'En attente';
  }

  return (
    <div className={`prediction-card ${outcomeClass}`}>
      <div className="card-header">
        <span className={`status-badge status-${prediction.status === 'À venir' ? 'pending' : 'completed'}`}>
          {prediction.status}
        </span>
        <span className="sport-badge">{prediction.sport}</span>
      </div>
      <div className="card-body">
        <h3>{prediction.teams}</h3>
        <p className="date-time">
          {format(new Date(prediction.matchDate), 'dd MMMM yyyy HH:mm', { locale: fr })}
        </p>
        <p><strong>Pronostic:</strong> {prediction.prediction}</p>
        <div className="odds-stake">
          <span>Cote: <strong>{prediction.odds.toFixed(2)}</strong></span>
          <span>Mise: <strong>{prediction.stake.toFixed(2)} €</strong></span>
        </div>

        {/* NOUVEAUX CHAMPS : Résultat Réel et Issue du Pronostic */}
        {prediction.status === 'Terminé' && ( // Affiche seulement si le match est "Terminé"
          <div className="result-section">
            <p><strong>Résultat Réel:</strong> {prediction.actualResult || 'Non renseigné'}</p>
            <p className="outcome-display">
              <strong>Issue:</strong> <span className={outcomeClass}>{outcomeText}</span>
            </p>
          </div>
        )}
      </div>

      {isAdmin && (
        <div className="card-actions">
          <button onClick={() => onEdit(prediction)} className="button-edit">
            Modifier
          </button>
          <button onClick={() => onDelete(prediction._id)} className="button-delete">
            Supprimer
          </button>
        </div>
      )}
    </div>
  );
}

export default PredictionCard;