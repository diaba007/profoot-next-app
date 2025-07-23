"use client"; // Composant Client

import React from 'react';

function PredictionFilter({ filterSport, setFilterSport, filterStatus, setFilterStatus }) {
  const handleSportChange = (e) => {
    setFilterSport(e.target.value);
  };

  const handleStatusChange = (e) => {
    setFilterStatus(e.target.value);
  };

  return (
    <div className="filter-container">
      <div className="filter-group">
        <label htmlFor="sport-filter">Filtrer par Sport:</label>
        <select id="sport-filter" value={filterSport} onChange={handleSportChange} className="select-input">
          <option value="Tous">Tous</option>
          <option value="football">Football</option>
          <option value="basketball">Basketball</option>
          <option value="tennis">Tennis</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="status-filter">Filtrer par Statut:</label>
        <select id="status-filter" value={filterStatus} onChange={handleStatusChange} className="select-input">
          <option value="Tous">Tous</option>
          <option value="À venir">À venir</option>
          <option value="Terminé">Terminé</option>
        </select>
      </div>
    </div>
  );
}

export default PredictionFilter;