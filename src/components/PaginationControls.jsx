// src/components/PaginationControls.jsx

"use client";

import React from 'react';

function PaginationControls({ currentPage, totalPages, onPageChange }) {
  // Ne pas afficher les contrôles si il n'y a qu'une seule page ou aucune
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="pagination-container">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="pagination-button"
      >
        Précédent
      </button>

      {/* Affichage des numéros de page (logique simplifiée pour éviter trop de boutons) */}
      {pages.map((pageNumber) => (
        <button
          key={pageNumber}
          onClick={() => onPageChange(pageNumber)}
          className={`pagination-button ${currentPage === pageNumber ? 'active' : ''}`}
          disabled={currentPage === pageNumber}
        >
          {pageNumber}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="pagination-button"
      >
        Suivant
      </button>
    </div>
  );
}

export default PaginationControls;
