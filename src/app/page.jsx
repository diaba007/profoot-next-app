// src/app/page.jsx

"use client";

import { useState, useEffect, useCallback } from 'react';
import PredictionForm from '../components/PredictionForm';
import PredictionList from '../components/PredictionList';
import PredictionFilter from '../components/PredictionFilter';
import PredictionSearch from '../components/PredictionSearch';
import PaginationControls from '../components/PaginationControls'; // NOUVEL IMPORT pour les contrôles de pagination
import { useSession, signIn, signOut } from 'next-auth/react';

export default function Home() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const isAdmin = isAuthenticated && session?.user?.role === 'admin';

  const [predictions, setPredictions] = useState([]);
  const [editingPrediction, setEditingPrediction] = useState(null);
  const [filterSport, setFilterSport] = useState('Tous');
  const [filterStatus, setFilterStatus] = useState('Tous');
  const [searchTerm, setSearchTerm] = useState('');
  const [totalBalance, setTotalBalance] = useState(0);
  const [apiError, setApiError] = useState(null);
  const [apiSuccess, setApiSuccess] = useState(null);

  // NOUVEAUX ÉTATS POUR LA PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limitPerPage, setLimitPerPage] = useState(10); // Vous pouvez rendre ceci configurable si vous voulez

  const showMessage = useCallback((message, type = 'error') => {
    if (type === 'error') {
      setApiError(message);
      setApiSuccess(null);
    } else {
      setApiSuccess(message);
      setApiError(null);
    }
    const timer = setTimeout(() => {
      setApiError(null);
      setApiSuccess(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const calculateTotalBalance = useCallback((preds) => {
    let balance = 0;
    preds.forEach(prediction => {
      if (prediction.status === 'Terminé' && prediction.outcome) {
        if (prediction.outcome === 'Gagnant') {
          balance += (prediction.stake * prediction.odds) - prediction.stake;
        } else if (prediction.outcome === 'Perdant') {
          balance -= prediction.stake;
        }
      }
    });
    setTotalBalance(balance);
  }, []);

  const fetchPredictions = useCallback(async () => {
    // AJOUT DES PARAMÈTRES DE PAGINATION À L'URL
    let url = `/api/predictions?page=${currentPage}&limit=${limitPerPage}&status=${filterStatus}&sport=${filterSport}&search=${searchTerm}`;
    setApiError(null);
    setApiSuccess(null);
    try {
      const res = await fetch(url);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      // MISE À JOUR DES ÉTATS AVEC LA NOUVELLE STRUCTURE DE RÉPONSE DE L'API
      setPredictions(data.predictions);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage); // S'assurer que la page actuelle est bien celle retournée par l'API
      calculateTotalBalance(data.predictions); // Calculer le bilan avec les pronostics de la page actuelle
    } catch (error) {
      console.error('Erreur lors de la récupération des pronostics:', error);
      showMessage(`Impossible de charger les pronostics: ${error.message || 'Erreur inconnue.'}`, 'error');
    }
  }, [currentPage, limitPerPage, filterSport, filterStatus, searchTerm, calculateTotalBalance, showMessage]);

  useEffect(() => {
    fetchPredictions();
  }, [fetchPredictions]);

  // Fonction pour changer de page
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleAddPrediction = async (newPrediction) => {
    setApiError(null);
    setApiSuccess(null);
    try {
      const res = await fetch('/api/predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPrediction),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
      }
      showMessage('Pronostic ajouté avec succès !', 'success');
      // Après ajout, revenir à la première page pour voir le nouveau pronostic
      setCurrentPage(1); // Important pour voir le nouveau pronostic
      fetchPredictions();
    } catch (error) {
      console.error('Erreur lors de l\'ajout du pronostic:', error);
      showMessage(`Erreur lors de l'ajout: ${error.message || 'Erreur inconnue.'}`, 'error');
    }
  };

  const handleEdit = (prediction) => {
    setEditingPrediction(prediction);
    setApiError(null);
    setApiSuccess(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdatePrediction = async (updatedPrediction) => {
    setApiError(null);
    setApiSuccess(null);
    try {
      const res = await fetch(`/api/predictions/${updatedPrediction._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPrediction),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
      }
      setEditingPrediction(null);
      showMessage('Pronostic mis à jour avec succès !', 'success');
      fetchPredictions(); // Rafraîchir la liste (reste sur la même page)
    } catch (error) {
      console.error('Erreur lors de la mise à jour du pronostic:', error);
      showMessage(`Erreur lors de la mise à jour: ${error.message || 'Erreur inconnue.'}`, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce pronostic ?')) {
      setApiError(null);
      setApiSuccess(null);
      try {
        const res = await fetch(`/api/predictions/${id}`, {
          method: 'DELETE',
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
        }
        showMessage('Pronostic supprimé avec succès !', 'success');
        // Après suppression, vérifier si la page actuelle est vide ou si elle est la dernière
        // Si oui, revenir à la page précédente si possible
        if (predictions.length === 1 && currentPage > 1) {
          setCurrentPage(prevPage => prevPage - 1);
        } else {
          fetchPredictions(); // Sinon, rafraîchir la page actuelle
        }
      } catch (error) {
        console.error('Erreur lors de la suppression du pronostic:', error);
        showMessage(`Erreur lors de la suppression: ${error.message || 'Erreur inconnue.'}`, 'error');
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingPrediction(null);
    setApiError(null);
    setApiSuccess(null);
  };

  if (status === 'loading') {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '50px', color: '#eee' }}>
        <p>Chargement de la session...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="header">
        <h1>Bienvenue sur ProFoot !</h1>
        <div className="auth-controls">
          {isAuthenticated ? (
            <>
              <span className="welcome-message">Bonjour, {session.user.name || session.user.email}!</span>
              <button onClick={() => signOut()} className="button-secondary">Déconnexion</button>
            </>
          ) : (
            <button onClick={() => signIn()} className="button-primary">Connexion</button>
          )}
        </div>
      </header>

      {apiError && <div className="api-message error-message-global">{apiError}</div>}
      {apiSuccess && <div className="api-message success-message-global">{apiSuccess}</div>}

      <div className={`total-balance ${totalBalance >= 0 ? 'balance-positive' : 'balance-negative'}`}>
        Bilan Global: <strong>{totalBalance.toFixed(2)} €</strong>
      </div>

      {isAdmin && (
        <PredictionForm
          onAddPrediction={handleAddPrediction}
          onUpdatePrediction={handleUpdatePrediction}
          onCancelEdit={handleCancelEdit}
          editingPrediction={editingPrediction}
        />
      )}

      <div className="filter-search-container">
        <PredictionFilter
          filterSport={filterSport}
          setFilterSport={setFilterSport}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
        />
        <PredictionSearch
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
      </div>

      <PredictionList predictions={predictions} onEdit={handleEdit} onDelete={handleDelete} isAdmin={isAdmin} />

      {/* NOUVEAU : Contrôles de pagination */}
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {/* Les styles CSS sont maintenant dans globals.css */}
    </div>
  );
}
