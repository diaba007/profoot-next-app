// src/app/api/predictions/route.js

import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Prediction from '../../data/predictions';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

// Gère les requêtes GET (récupérer tous les pronostics avec pagination et filtres)
export async function GET(request) {
  await connectDB();
  try {
    const { searchParams } = new URL(request.url);

    // Paramètres de filtre existants
    const sport = searchParams.get('sport');
    const status = searchParams.get('status');
    const searchTerm = searchParams.get('search');

    // NOUVEAUX PARAMÈTRES DE PAGINATION
    const page = parseInt(searchParams.get('page') || '1', 10); // Page actuelle, par défaut 1
    const limit = parseInt(searchParams.get('limit') || '10', 10); // Nombre de pronostics par page, par défaut 10

    let query = {};

    if (sport && sport !== 'Tous') {
      query.sport = sport;
    }
    if (status && status !== 'Tous') {
      query.status = status;
    }
    if (searchTerm) {
      query.$or = [
        { teams: { $regex: searchTerm, $options: 'i' } },
        { prediction: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    // Calculer le nombre total de pronostics correspondant aux filtres
    const totalPredictions = await Prediction.countDocuments(query);

    // Calculer le nombre de documents à sauter (offset)
    const skip = (page - 1) * limit;

    // Récupérer les pronostics pour la page actuelle
    const predictions = await Prediction.find(query)
      .sort({ matchDate: -1 }) // Triez par date de match, les plus récents en premier
      .skip(skip) // Sauter les documents des pages précédentes
      .limit(limit); // Limiter au nombre de documents par page

    // Retourner les pronostics et le nombre total pour la pagination côté client
    return NextResponse.json({
      predictions,
      totalPredictions,
      currentPage: page,
      limit,
      totalPages: Math.ceil(totalPredictions / limit),
    }, { status: 200 });

  } catch (error) {
    console.error('Erreur GET /api/predictions:', error);
    return NextResponse.json({ message: 'Erreur serveur lors de la récupération des pronostics.', error: error.message }, { status: 500 });
  }
}

// Gère les requêtes POST (ajouter un nouveau pronostic)
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Accès non autorisé. Seuls les admins peuvent ajouter des pronostics.' }, { status: 403 });
  }

  await connectDB();
  try {
    const body = await request.json();
    if (body.status !== 'Terminé') {
      body.actualResult = null;
      body.outcome = null;
    }
    const newPrediction = await Prediction.create(body);
    return NextResponse.json(newPrediction, { status: 201 });
  } catch (error) {
    console.error('Erreur POST /api/predictions:', error);
    return NextResponse.json({ message: 'Erreur serveur lors de l\'ajout du pronostic.', error: error.message }, { status: 500 });
  }
}
