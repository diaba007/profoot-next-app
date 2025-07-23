// src/components/PredictionList.jsx
import React from 'react';
import PredictionCard from './PredictionCard.jsx';

function PredictionList({ predictions, isAdmin, onEdit, onDelete }) {
  const displayPredictions = predictions;

  return (
    <div className="prediction-grid">
      {displayPredictions.length > 0 ? (
        displayPredictions.map((prediction) => (
          <PredictionCard
            key={prediction._id}
            prediction={prediction}
            isAdmin={isAdmin}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))
      ) : (
        <p className="no-predictions-message">Aucun pronostic trouvé pour cette sélection.</p>
      )}
    </div>
  );
}

export default PredictionList;