// src/components/PredictionSearch.jsx

"use client"; // Composant Client

import React from 'react';

function PredictionSearch({ searchTerm, setSearchTerm }) {
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="search-container">
      <label htmlFor="search-input">Rechercher:</label>
      <input
        id="search-input"
        type="text"
        placeholder="Rechercher par équipes ou pronostic..."
        value={searchTerm}
        onChange={handleSearchChange}
        className="text-input"
      />
    </div>
  );
}

export default PredictionSearch;