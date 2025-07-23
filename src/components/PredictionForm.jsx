// src/components/PredictionForm.jsx

"use client";

import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns'; // Importez parseISO pour convertir la chaîne ISO en Date

function PredictionForm({ onAddPrediction, onUpdatePrediction, onCancelEdit, editingPrediction }) {
  const initialFormState = {
    sport: 'football',
    matchDate: '',
    teams: '',
    prediction: '',
    odds: '',
    stake: '',
    status: 'À venir', // Par défaut pour les nouveaux pronostics
    actualResult: '', // Champs pour les mises à jour
    outcome: null, // Initialisé à null
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({}); // NOUVEAU : État pour gérer les erreurs de validation
  const [isNewPrediction, setIsNewPrediction] = useState(true); // NOUVEAU : Pour distinguer ajout/édition

  useEffect(() => {
    if (editingPrediction) {
      // Pour l'édition, on pré-remplit le formulaire
      setFormData({
        ...editingPrediction,
        // Formater la date en 'yyyy-MM-dd'T'HH:mm' pour l'input datetime-local
        matchDate: format(new Date(editingPrediction.matchDate), "yyyy-MM-dd'T'HH:mm"),
        // Assurez-vous que odds et stake sont des chaînes pour les inputs
        odds: editingPrediction.odds.toString(),
        stake: editingPrediction.stake.toString(),
      });
      setIsNewPrediction(false); // Mode édition
    } else {
      // Pour un nouveau pronostic, réinitialiser le formulaire
      setFormData(initialFormState);
      setIsNewPrediction(true); // Mode ajout
    }
    setErrors({}); // Réinitialiser les erreurs à chaque changement de mode
  }, [editingPrediction]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Efface l'erreur pour le champ modifié dès que l'utilisateur tape
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // NOUVEAU : Fonction de validation
  const validateForm = () => {
    let newErrors = {};
    let isValid = true;

    // Validation des champs communs (requis)
    if (!formData.sport) { newErrors.sport = 'Le sport est requis.'; isValid = false; }
    if (!formData.matchDate) { newErrors.matchDate = 'La date du match est requise.'; isValid = false; }
    if (!formData.teams.trim()) { newErrors.teams = 'Les équipes sont requises.'; isValid = false; }
    if (!formData.prediction.trim()) { newErrors.prediction = 'Le pronostic est requis.'; isValid = false; }
    if (!formData.odds || isNaN(parseFloat(formData.odds)) || parseFloat(formData.odds) <= 0) {
      newErrors.odds = 'La cote doit être un nombre positif.'; isValid = false;
    }
    if (!formData.stake || isNaN(parseFloat(formData.stake)) || parseFloat(formData.stake) <= 0) {
      newErrors.stake = 'La mise doit être un nombre positif.'; isValid = false;
    }

    // Validation spécifique pour les nouveaux pronostics (matchDate dans le futur)
    if (isNewPrediction && formData.matchDate) {
      const selectedDate = parseISO(formData.matchDate);
      if (selectedDate <= new Date()) {
        newErrors.matchDate = 'Pour un nouveau pronostic, la date du match doit être future.';
        isValid = false;
      }
    }

    // Validation spécifique pour les pronostics terminés (actualResult et outcome requis)
    if (formData.status === 'Terminé') {
      if (!formData.actualResult.trim()) {
        newErrors.actualResult = 'Le résultat réel est requis pour un pronostic terminé.';
        isValid = false;
      }
      if (!formData.outcome) { // outcome peut être null, 'Gagnant', 'Perdant', 'Nul'
        newErrors.outcome = 'L\'issue du pronostic est requise pour un pronostic terminé.';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) { // Appel de la fonction de validation
      // Préparer les données pour l'envoi à l'API
      const dataToSend = {
        ...formData,
        odds: parseFloat(formData.odds),
        stake: parseFloat(formData.stake),
        // Si le pronostic n'est pas terminé, s'assurer que actualResult et outcome sont null
        actualResult: formData.status === 'Terminé' ? formData.actualResult : null,
        outcome: formData.status === 'Terminé' ? formData.outcome : null,
      };

      if (editingPrediction) {
        onUpdatePrediction(dataToSend);
      } else {
        onAddPrediction(dataToSend);
      }
    } else {
      console.log('Formulaire invalide', errors);
      // Vous pourriez afficher un message général ou juste les erreurs individuelles
    }
  };

  return (
    <div className="prediction-form-container">
      <h2>{editingPrediction ? 'Modifier le Pronostic' : 'Ajouter un Nouveau Pronostic'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="sport">Sport:</label>
          <select id="sport" name="sport" value={formData.sport} onChange={handleChange} className="select-input">
            <option value="football">Football</option>
            <option value="basketball">Basketball</option>
            <option value="tennis">Tennis</option>
          </select>
          {errors.sport && <p className="error-message">{errors.sport}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="matchDate">Date et Heure du Match:</label>
          <input
            type="datetime-local"
            id="matchDate"
            name="matchDate"
            value={formData.matchDate}
            onChange={handleChange}
            className="text-input"
          />
          {errors.matchDate && <p className="error-message">{errors.matchDate}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="teams">Équipes (ex: PSG vs OM):</label>
          <input
            type="text"
            id="teams"
            name="teams"
            value={formData.teams}
            onChange={handleChange}
            placeholder="Ex: Équipe A vs Équipe B"
            className="text-input"
          />
          {errors.teams && <p className="error-message">{errors.teams}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="prediction">Votre Pronostic:</label>
          <input
            type="text"
            id="prediction"
            name="prediction"
            value={formData.prediction}
            onChange={handleChange}
            placeholder="Ex: Victoire équipe A, Plus de 2.5 buts"
            className="text-input"
          />
          {errors.prediction && <p className="error-message">{errors.prediction}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="odds">Cote:</label>
          <input
            type="number"
            id="odds"
            name="odds"
            value={formData.odds}
            onChange={handleChange}
            step="0.01"
            placeholder="Ex: 1.85"
            className="text-input"
          />
          {errors.odds && <p className="error-message">{errors.odds}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="stake">Mise (€):</label>
          <input
            type="number"
            id="stake"
            name="stake"
            value={formData.stake}
            onChange={handleChange}
            step="0.01"
            placeholder="Ex: 10.00"
            className="text-input"
          />
          {errors.stake && <p className="error-message">{errors.stake}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="status">Statut:</label>
          <select id="status" name="status" value={formData.status} onChange={handleChange} className="select-input">
            <option value="À venir">À venir</option>
            <option value="Terminé">Terminé</option>
          </select>
          {errors.status && <p className="error-message">{errors.status}</p>}
        </div>

        {formData.status === 'Terminé' && (
          <>
            <div className="form-group">
              <label htmlFor="actualResult">Résultat Réel:</label>
              <input
                type="text"
                id="actualResult"
                name="actualResult"
                value={formData.actualResult}
                onChange={handleChange}
                placeholder="Ex: 2-1, Annulé"
                className="text-input"
              />
              {errors.actualResult && <p className="error-message">{errors.actualResult}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="outcome">Issue du Pronostic:</label>
              <select id="outcome" name="outcome" value={formData.outcome || ''} onChange={handleChange} className="select-input">
                <option value="">Sélectionner une issue</option> {/* Option vide par défaut */}
                <option value="Gagnant">Gagnant</option>
                <option value="Perdant">Perdant</option>
                <option value="Nul">Nul</option>
              </select>
              {errors.outcome && <p className="error-message">{errors.outcome}</p>}
            </div>
          </>
        )}

        <div className="form-actions">
          <button type="submit" className="button-primary">
            {editingPrediction ? 'Mettre à Jour le Pronostic' : 'Ajouter le Pronostic'}
          </button>
          {editingPrediction && (
            <button type="button" onClick={onCancelEdit} className="button-secondary">
              Annuler
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default PredictionForm;